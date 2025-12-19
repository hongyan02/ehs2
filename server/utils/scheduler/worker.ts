import { eq } from "drizzle-orm";

import { db } from "../../db/db";
import { schedulerTask } from "../../db/schema";
import type { SchedulerWorkerRequest, SchedulerWorkerResponse } from "./protocol";
import { getJobHandler, type SchedulerTaskRow } from "./registry";
import { runTaskLogic } from "./runner";

// --- Message Handling with Dynamic Imports ---

(async () => {
    // Dynamically import node-cron and worker_threads
    // Use string literals for webpack externals to work correctly
    const cron = await import("node-cron");
    const { parentPort, isMainThread } = await import("worker_threads");

    type ScheduledTask = ReturnType<typeof cron.default.schedule>;
    type ScheduledEntry = { job: ScheduledTask; signature: string };

    const scheduledJobs = new Map<number, ScheduledEntry>();
    const taskChains = new Map<number, Promise<unknown>>();

    const rawConcurrency = Number(process.env.SCHEDULER_MAX_CONCURRENCY ?? "2");
    const maxConcurrency = Number.isFinite(rawConcurrency) && rawConcurrency > 0
        ? Math.floor(rawConcurrency)
        : 2;

    let inFlight = 0;
    const queue: Array<() => void> = [];

    const postMessage = (message: SchedulerWorkerResponse) => {
        if (parentPort) parentPort.postMessage(message);
    };

    const postLog = (message: string) => postMessage({ type: "log", message });
    const postError = (message: string) => postMessage({ type: "error", message });
    const postTriggerSuccess = (taskId: number) => postMessage({ type: "triggerSuccess", taskId });
    const postTriggerError = (taskId: number, message: string) =>
        postMessage({ type: "triggerError", taskId, message });

    const runWithLimit = <T>(fn: () => Promise<T>): Promise<T> =>
        new Promise((resolve, reject) => {
            const run = () => {
                inFlight += 1;
                fn()
                    .then(resolve, reject)
                    .finally(() => {
                        inFlight -= 1;
                        const next = queue.shift();
                        if (next) next();
                    });
            };

            if (inFlight < maxConcurrency) {
                run();
            } else {
                queue.push(run);
            }
        });

    const enqueueTask = <T>(
        taskId: number,
        fn: () => Promise<T>,
        mode: "skip" | "queue"
    ): { skipped: boolean; promise?: Promise<T> } => {
        if (mode === "skip" && taskChains.has(taskId)) {
            return { skipped: true };
        }

        const previous = taskChains.get(taskId) ?? Promise.resolve();
        const next = previous
            .catch(() => undefined)
            .then(() => runWithLimit(fn));

        taskChains.set(taskId, next);
        next.finally(() => {
            if (taskChains.get(taskId) === next) {
                taskChains.delete(taskId);
            }
        });

        return { skipped: false, promise: next as Promise<T> };
    };

    const buildTaskSignature = (task: SchedulerTaskRow, cronExpression: string) => {
        const payloadKey = task.payload ?? "";
        return `${task.jobKey}|${cronExpression}|${task.enabled}|${payloadKey}`;
    };

    const stopScheduledJob = (taskId: number) => {
        const entry = scheduledJobs.get(taskId);
        if (entry) {
            entry.job.stop();
            scheduledJobs.delete(taskId);
        }
    };

    const scheduleTask = (task: SchedulerTaskRow, cronExpression: string, signature: string) => {
        const scheduled = cron.default.schedule(
            cronExpression,
            () => {
                const queued = enqueueTask(task.id, () => runTaskLogic(task), "skip");
                if (queued.skipped) {
                    console.warn(`[Worker] Task ${task.id} is already running, skipping this tick`);
                    return;
                }

                queued.promise?.catch((error) =>
                    console.error(`[Worker] Scheduled task ${task.id} failed`, error)
                );
            },
            { timezone: "Asia/Shanghai" }
        );

        scheduledJobs.set(task.id, { job: scheduled, signature });
    };

    const refreshScheduledTasks = async () => {
        try {
            const tasks = await db.select().from(schedulerTask);
            const seenIds = new Set<number>();
            let scheduled = 0;
            let updated = 0;
            let kept = 0;
            let removed = 0;
            let invalid = 0;

            tasks.forEach((task) => {
                seenIds.add(task.id);

                const cronExpression = task.cron?.trim() ?? "";
                if (!task.enabled || !cronExpression) {
                    if (scheduledJobs.has(task.id)) {
                        stopScheduledJob(task.id);
                        removed += 1;
                    }
                    return;
                }

                if (!cron.default.validate(cronExpression)) {
                    console.warn(`[Worker] Invalid cron expression for task ${task.id}: ${task.cron}`);
                    invalid += 1;
                    if (scheduledJobs.has(task.id)) {
                        stopScheduledJob(task.id);
                        removed += 1;
                    }
                    return;
                }

                if (!getJobHandler(task.jobKey)) {
                    console.warn(`[Worker] No handler for jobKey=${task.jobKey}, task ${task.id} skipped`);
                    invalid += 1;
                    if (scheduledJobs.has(task.id)) {
                        stopScheduledJob(task.id);
                        removed += 1;
                    }
                    return;
                }

                const signature = buildTaskSignature(task, cronExpression);
                const existing = scheduledJobs.get(task.id);
                if (existing && existing.signature === signature) {
                    kept += 1;
                    return;
                }

                if (existing) {
                    stopScheduledJob(task.id);
                    updated += 1;
                } else {
                    scheduled += 1;
                }

                scheduleTask(task, cronExpression, signature);
            });

            const staleIds: number[] = [];
            for (const taskId of scheduledJobs.keys()) {
                if (!seenIds.has(taskId)) staleIds.push(taskId);
            }
            staleIds.forEach((taskId) => {
                stopScheduledJob(taskId);
                removed += 1;
            });

            postLog(
                `Refreshed tasks: scheduled=${scheduled}, updated=${updated}, kept=${kept}, removed=${removed}, invalid=${invalid}`
            );
        } catch (e: any) {
            postError(e instanceof Error ? e.message : String(e));
        }
    };

    const refreshSingleTask = async (taskId: number) => {
        try {
            const rows = await db
                .select()
                .from(schedulerTask)
                .where(eq(schedulerTask.id, taskId));

            const task = rows[0];
            if (!task) {
                stopScheduledJob(taskId);
                return;
            }

            const cronExpression = task.cron?.trim() ?? "";
            if (!task.enabled || !cronExpression) {
                stopScheduledJob(taskId);
                return;
            }

            if (!cron.default.validate(cronExpression)) {
                console.warn(`[Worker] Invalid cron expression for task ${task.id}: ${task.cron}`);
                stopScheduledJob(task.id);
                return;
            }

            if (!getJobHandler(task.jobKey)) {
                console.warn(`[Worker] No handler for jobKey=${task.jobKey}, task ${task.id} skipped`);
                stopScheduledJob(task.id);
                return;
            }

            const signature = buildTaskSignature(task, cronExpression);
            const existing = scheduledJobs.get(task.id);
            if (existing && existing.signature === signature) {
                return;
            }

            if (existing) {
                stopScheduledJob(task.id);
            }

            scheduleTask(task, cronExpression, signature);
        } catch (e: any) {
            postError(e instanceof Error ? e.message : String(e));
        }
    };

    const triggerTaskById = async (taskId: number) => {
        try {
            const rows = await db
                .select()
                .from(schedulerTask)
                .where(eq(schedulerTask.id, taskId));
            if (!rows[0]) {
                postTriggerError(taskId, "任务不存在");
                return;
            }

            const queued = enqueueTask(taskId, () => runTaskLogic(rows[0]), "queue");
            if (!queued.promise) {
                postTriggerError(taskId, "任务正在执行");
                return;
            }

            await queued.promise;
            postTriggerSuccess(taskId);
        } catch (error: any) {
            postTriggerError(taskId, error instanceof Error ? error.message : String(error));
        }
    };

    if (!isMainThread && parentPort) {
        parentPort.on("message", async (msg: SchedulerWorkerRequest) => {
            try {
                switch (msg.type) {
                    case "init":
                        await refreshScheduledTasks();
                        break;
                    case "refresh":
                        if (typeof msg.taskId === "number") {
                            await refreshSingleTask(msg.taskId);
                        } else {
                            await refreshScheduledTasks();
                        }
                        break;
                    case "trigger":
                        // Trigger a specific task immediately
                        if (typeof msg.taskId === "number") {
                            await triggerTaskById(msg.taskId);
                        } else {
                            postTriggerError(-1, "无效的任务ID");
                        }
                        break;
                }
            } catch (error: any) {
                console.error("[Worker] Error handling message:", error);
                if (msg.type === "trigger") {
                    postTriggerError(msg.taskId, error instanceof Error ? error.message : String(error));
                } else {
                    postError(error instanceof Error ? error.message : String(error));
                }
            }
        });

        // Initial load
        await refreshScheduledTasks();
    }
})();
