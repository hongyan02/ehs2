import type { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

import type { SchedulerWorkerRequest, SchedulerWorkerResponse } from "./protocol";
export { SUPPORTED_JOB_KEYS, type SupportedJobKey } from "./constants";

let worker: Worker | null = null;
type TimeoutHandle = ReturnType<typeof setTimeout>;
type PendingTrigger = {
    resolve: (val: unknown) => void;
    reject: (err: Error) => void;
    timeout: TimeoutHandle;
};
const pendingTriggers = new Map<number, PendingTrigger>();

const getWorkerPath = () => {
    const root = process.cwd();
    const configuredPath = process.env.SCHEDULER_WORKER_PATH;

    if (configuredPath) {
        const resolved = path.isAbsolute(configuredPath)
            ? configuredPath
            : path.join(root, configuredPath);
        if (fs.existsSync(resolved)) return resolved;
    }

    // 1. Try to find the worker in the same directory as this file (if not bundled)
    const localJs = path.resolve(__dirname, "./worker.js");
    if (fs.existsSync(localJs)) return localJs;

    // 2. Try TS worker next to this file (dev)
    const localTs = path.resolve(__dirname, "./worker.ts");
    if (fs.existsSync(localTs)) return localTs;

    // 3. Try absolute path from project root (server/utils/scheduler/worker.ts)
    // capable of handling dev environment or source-mapped prod
    const tsPath = path.join(root, "server/utils/scheduler/worker.ts");
    if (fs.existsSync(tsPath)) return tsPath;

    // 4. Try JS path in server/utils (if compiled externally)
    const jsPath = path.join(root, "server/utils/scheduler/worker.js");
    if (fs.existsSync(jsPath)) return jsPath;

    return tsPath; // Default fallback to TS path
};

// 重启 Worker 策略
const restartWorker = () => {
    console.log("[Scheduler] Restarting worker in 5s...");
    setTimeout(() => {
        startScheduler(true);
    }, 5000);
};

export const startScheduler = async (forceRestart = false) => {
    if (worker && !forceRestart) return;
    if (worker) {
        rejectAllPending(new Error("Scheduler worker restarting"));
        await worker.terminate();
        worker = null;
    }

    const workerPath = getWorkerPath();
    console.log(`[Scheduler] Starting worker from: ${workerPath}`);

    try {
        // Dynamically import worker_threads to avoid Next.js build issues
        // Use string literal for webpack externals to work correctly
        const { Worker: WorkerClass } = await import("worker_threads");

        // In production, we need tsx OR ts-node to run .ts worker files
        // since Next.js doesn't compile server/utils separately
        const needsTsLoader = workerPath.endsWith(".ts");
        const workerOptions = needsTsLoader ? { execArgv: ["-r", "tsx/cjs"] } : {};

        worker = new WorkerClass(workerPath, workerOptions);

        worker!.on("message", (msg: SchedulerWorkerResponse) => {
            switch (msg.type) {
                case "log":
                    console.log(`[Scheduler Worker] ${msg.message}`);
                    break;
                case "error":
                    console.error(`[Scheduler Worker Error] ${msg.message}`);
                    break;
                case "triggerSuccess":
                    settleTrigger(msg.taskId, (pending) => pending.resolve("triggered via worker"));
                    break;
                case "triggerError":
                    settleTrigger(msg.taskId, (pending) => pending.reject(new Error(msg.message)));
                    break;
            }
        });

        worker!.on("error", (err) => {
            console.error("[Scheduler] Worker error:", err);
            rejectAllPending(err);
            restartWorker();
        });

        worker!.on("exit", (code) => {
            if (pendingTriggers.size > 0) {
                rejectAllPending(new Error(`Scheduler worker exited with code ${code}`));
            }
            if (code !== 0) {
                console.error(`[Scheduler] Worker stopped with exit code ${code}`);
                restartWorker();
            }
        });

    } catch (error) {
        console.error("[Scheduler] Failed to verify worker path or start worker:", error);
    }
};

export const refreshScheduledTasks = async (taskId?: number) => {
    if (worker) {
        const message: SchedulerWorkerRequest = taskId === undefined
            ? { type: "refresh" }
            : { type: "refresh", taskId };
        worker.postMessage(message);
    } else {
        // Fallback: 如果 worker 没启动，尝试启动?
        // console.warn("[Scheduler] Worker not running, cannot refresh tasks");
    }
};

export const rescheduleTask = async (taskId: number) => {
    // 仅刷新指定任务，减少全量重建
    return refreshScheduledTasks(taskId);
};

export const runTaskById = async (taskId: number) => {
    if (!worker) {
        throw new Error("Scheduler worker is not running");
    }

    return new Promise((resolve, reject) => {
        const existing = pendingTriggers.get(taskId);
        if (existing) {
            pendingTriggers.delete(taskId);
            clearTimeout(existing.timeout);
            existing.reject(new Error("Worker trigger superseded by a new request"));
        }

        const timeout = setTimeout(() => {
            settleTrigger(taskId, (pending) => pending.reject(new Error("Worker trigger timed out")));
        }, 10000);

        pendingTriggers.set(taskId, { resolve, reject, timeout });

        const message: SchedulerWorkerRequest = { type: "trigger", taskId };
        worker?.postMessage(message);
    });
};

const settleTrigger = (taskId: number, action: (pending: PendingTrigger) => void) => {
    const pending = pendingTriggers.get(taskId);
    if (!pending) return;
    pendingTriggers.delete(taskId);
    clearTimeout(pending.timeout);
    action(pending);
};

const rejectAllPending = (error: Error) => {
    pendingTriggers.forEach((pending) => {
        clearTimeout(pending.timeout);
        pending.reject(error);
    });
    pendingTriggers.clear();
};

// 保持主要逻辑兼容
export const runTask = async (task: any) => {
    // Deprecated for direct call, redirect to worker logic
    // 但为了兼容旧代码引用，这里转发
    return runTaskById(task.id);
};
