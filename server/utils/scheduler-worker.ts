import { eq } from "drizzle-orm";

import { db } from "../db/db";
import { schedulerTask } from "../db/schema";
import { sendDutyLeaderTextMessage } from "../api/wxWork/dutyLog/services";
import { sendDutyScheduleWebhook } from "../api/webhook/dutySchedule/services";

type SchedulerTaskRow = typeof schedulerTask.$inferSelect;
type JobHandler = (task: SchedulerTaskRow) => Promise<unknown>;

export const SUPPORTED_JOB_KEYS = ["send-duty-leader-text", "send-duty-schedule-webhook"] as const;
export type SupportedJobKey = (typeof SUPPORTED_JOB_KEYS)[number];

// --- Helper Functions (Copied from original scheduler.ts to ensure isolation) ---

const timeNow = () =>
    new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Shanghai", hour12: false })
        .replace("T", " ");

const parsePayload = (payload: unknown): unknown => {
    if (typeof payload === "string") {
        try {
            return JSON.parse(payload);
        } catch {
            return null;
        }
    }
    return payload;
};

const getShiftFromPayload = (payload: unknown): number => {
    if (payload && typeof payload === "object" && "shift" in payload) {
        const value = (payload as { shift?: unknown }).shift;
        if (value === 1 || value === "1" || value === 0 || value === "0") {
            return Number(value);
        }
    }
    return 0; // default to day shift
};

const getContentFromPayload = (payload: unknown): string | undefined => {
    if (payload && typeof payload === "object" && "content" in payload) {
        const value = (payload as { content?: unknown }).content;
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }
    return undefined;
};

const jobHandlers: Record<SupportedJobKey, JobHandler> = {
    "send-duty-leader-text": async (task) => {
        const payload = parsePayload(task.payload);
        const shift = getShiftFromPayload(payload);
        const content = getContentFromPayload(payload);
        return sendDutyLeaderTextMessage({ shift, content });
    },
    "send-duty-schedule-webhook": async (task) => {
        const payload = parsePayload(task.payload);
        const shift = getShiftFromPayload(payload);
        const content = getContentFromPayload(payload);
        return sendDutyScheduleWebhook({ shift, content });
    },
};

const getJobHandler = (jobKey: string): JobHandler | undefined =>
    jobHandlers[jobKey as SupportedJobKey];

// --- Core Logic ---

const runTaskLogic = async (task: SchedulerTaskRow) => {
    const handler = getJobHandler(task.jobKey);
    if (!handler) {
        throw new Error(`No handler registered for jobKey=${task.jobKey}`);
    }

    const startedAt = timeNow();

    try {
        const result = await handler(task);

        await db
            .update(schedulerTask)
            .set({
                lastRunAt: startedAt,
                lastStatus: "success",
                lastError: null,
                updatedAt: timeNow(),
            })
            .where(eq(schedulerTask.id, task.id));

        return result;
    } catch (error) {
        await db
            .update(schedulerTask)
            .set({
                lastRunAt: startedAt,
                lastStatus: "failed",
                lastError: error instanceof Error ? error.message : String(error),
                updatedAt: timeNow(),
            })
            .where(eq(schedulerTask.id, task.id));

        throw error;
    }
};

// --- Message Handling with Dynamic Imports ---

(async () => {
    // Dynamically import node-cron and worker_threads
    // Use string literals for webpack externals to work correctly
    const cron = await import("node-cron");
    const { parentPort, isMainThread } = await import("worker_threads");

    type ScheduledTask = ReturnType<typeof cron.default.schedule>;
    const scheduledJobs = new Map<number, ScheduledTask>();

    const stopScheduledJob = (taskId: number) => {
        const job = scheduledJobs.get(taskId);
        if (job) {
            job.stop();
            scheduledJobs.delete(taskId);
        }
    };

    const scheduleSingleTask = (task: SchedulerTaskRow, parentPort: any) => {
        stopScheduledJob(task.id);

        if (!task.enabled || !task.cron) {
            return;
        }

        if (!cron.default.validate(task.cron)) {
            console.warn(`[Worker] Invalid cron expression for task ${task.id}: ${task.cron}`);
            return;
        }

        const handler = getJobHandler(task.jobKey);
        if (!handler) {
            console.warn(`[Worker] No handler for jobKey=${task.jobKey}, task ${task.id} skipped`);
            return;
        }

        const scheduled = cron.default.schedule(
            task.cron,
            () => {
                runTaskLogic(task).catch((error) =>
                    console.error(`[Worker] Scheduled task ${task.id} failed`, error)
                );
            },
            { timezone: "Asia/Shanghai" }
        );

        scheduledJobs.set(task.id, scheduled);
    };

    const refreshScheduledTasks = async (parentPort: any) => {
        // 停止所有现有任务
        scheduledJobs.forEach((job) => job.stop());
        scheduledJobs.clear();

        try {
            const tasks = await db
                .select()
                .from(schedulerTask)
                .where(eq(schedulerTask.enabled, 1));

            tasks.forEach((task) => {
                if (task.cron) {
                    scheduleSingleTask(task, parentPort);
                }
            });

            if (parentPort) parentPort.postMessage({ type: 'log', message: `Refreshed ${tasks.length} tasks` });
        } catch (e: any) {
            if (parentPort) parentPort.postMessage({ type: 'error', message: e.message });
        }
    };

    if (!isMainThread && parentPort) {
        parentPort.on("message", async (msg: any) => {
            try {
                switch (msg.type) {
                    case "init":
                    case "refresh":
                        await refreshScheduledTasks(parentPort);
                        break;
                    case "trigger":
                        // Trigger a specific task immediately
                        if (msg.taskId) {
                            const rows = await db
                                .select()
                                .from(schedulerTask)
                                .where(eq(schedulerTask.id, msg.taskId));
                            if (rows[0]) {
                                await runTaskLogic(rows[0]);
                                parentPort?.postMessage({ type: 'triggerSuccess', taskId: msg.taskId });
                            }
                        }
                        break;
                }
            } catch (error: any) {
                console.error("[Worker] Error handling message:", error);
                parentPort?.postMessage({ type: 'error', message: error.message });
            }
        });

        // Initial load
        await refreshScheduledTasks(parentPort);
    }
})();
