import type { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

// 保持这些导出以供 Controller 使用
export const SUPPORTED_JOB_KEYS = ["send-duty-leader-text", "send-duty-schedule-webhook"] as const;
export type SupportedJobKey = (typeof SUPPORTED_JOB_KEYS)[number];

let worker: Worker | null = null;
const pendingTriggers = new Map<number, { resolve: (val: unknown) => void; reject: (err: Error) => void }>();

const getWorkerPath = () => {
    const root = process.cwd();

    // 1. Try to find the worker in the same directory as this file (if not bundled)
    const localJs = path.resolve(__dirname, "./scheduler-worker.js");
    if (fs.existsSync(localJs)) return localJs;

    // 2. Try absolute path from project root (server/utils/scheduler-worker.ts)
    // capable of handling dev environment or source-mapped prod
    const tsPath = path.join(root, "server/utils/scheduler-worker.ts");
    if (fs.existsSync(tsPath)) return tsPath;

    // 3. Try JS path in server/utils (if compiled externally)
    const jsPath = path.join(root, "server/utils/scheduler-worker.js");
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
        await worker.terminate();
        worker = null;
    }

    const workerPath = getWorkerPath();
    console.log(`[Scheduler] Starting worker from: ${workerPath}`);

    try {
        // 在 Dev 环境下 (next dev)，直接运行 .ts 需要 loader 支持
        // 这里假设环境支持 (如使用了 tsx 或 ts-node)
        // 如果失败，可能需要针对环境调整 execArgv
        const isTs = workerPath.endsWith(".ts");
        const workerOptions = isTs ? {
            // 尝试使用 tsx loader 如果是 TS 文件
            execArgv: ["--import", "tsx/esm"],
        } : {};

        // 注意：Next.js 环境下 --import tsx/esm 可能需要 tsx 在 node_modules 中
        // 如果这里报错，用户可能需要手动处理 worker 加载
        // 为了兼容性，我们先不加 execArgv，看看 runtime 是否像 bun/deno 或 patched node 那样支持
        // 或者依靠 ts-node/register
        // *Correction*: node-cron 通常在后端运行。如果是纯 node 运行 build 后的产物，是 js。
        // 如果是 next dev，通过 check if tsx is available via execArgg might be safer but complex.

        // Dynamically import worker_threads to avoid Next.js build issues
        // Use string literal for webpack externals to work correctly
        const { Worker: WorkerClass } = await import("worker_threads");

        // In production, we need tsx OR ts-node to run .ts worker files
        // since Next.js doesn't compile server/utils separately
        const needsTsLoader = workerPath.endsWith('.ts');

        worker = new WorkerClass(workerPath, needsTsLoader ? {
            // Use tsx for loading TypeScript in worker
            execArgv: ['-r', 'tsx/cjs']
        } : {});

        worker!.on("message", (msg) => {
            if (msg.type === 'log') {
                console.log(`[Scheduler Worker] ${msg.message}`);
            } else if (msg.type === 'error') {
                console.error(`[Scheduler Worker Error] ${msg.message}`);
            } else if (msg.type === 'triggerSuccess') {
                const p = pendingTriggers.get(msg.taskId);
                if (p) {
                    p.resolve("triggered via worker");
                    pendingTriggers.delete(msg.taskId);
                }
            }
        });

        worker!.on("error", (err) => {
            console.error("[Scheduler] Worker error:", err);
            restartWorker();
        });

        worker!.on("exit", (code) => {
            if (code !== 0) {
                console.error(`[Scheduler] Worker stopped with exit code ${code}`);
                restartWorker();
            }
        });

        // 初始化
        worker!.postMessage({ type: "init" });

    } catch (error) {
        console.error("[Scheduler] Failed to verify worker path or start worker:", error);
    }
};

export const refreshScheduledTasks = async () => {
    if (worker) {
        worker.postMessage({ type: "refresh" });
    } else {
        // Fallback: 如果 worker 没启动，尝试启动?
        // console.warn("[Scheduler] Worker not running, cannot refresh tasks");
    }
};

export const rescheduleTask = async (taskId: number) => {
    // 简单地让 Worker 刷新全部，或者可以优化为只刷新单个
    // 这里保持简单
    return refreshScheduledTasks();
};

export const runTaskById = async (taskId: number) => {
    if (!worker) {
        throw new Error("Scheduler worker is not running");
    }

    return new Promise((resolve, reject) => {
        // 设置超时
        const timeout = setTimeout(() => {
            if (pendingTriggers.has(taskId)) {
                pendingTriggers.delete(taskId);
                reject(new Error("Worker trigger timed out"));
            }
        }, 10000);

        pendingTriggers.set(taskId, {
            resolve: (val) => { clearTimeout(timeout); resolve(val); },
            reject: (err) => { clearTimeout(timeout); reject(err); }
        });

        worker?.postMessage({ type: 'trigger', taskId });
    });
};

// 保持主要逻辑兼容
export const runTask = async (task: any) => {
    // Deprecated for direct call, redirect to worker logic
    // 但为了兼容旧代码引用，这里转发
    return runTaskById(task.id);
};
