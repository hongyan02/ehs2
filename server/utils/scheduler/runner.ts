import { eq } from "drizzle-orm";

import { db } from "../../db/db";
import { schedulerTask } from "../../db/schema";
import { getJobHandler, type SchedulerTaskRow } from "./registry";

const timeNow = () =>
    new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Shanghai", hour12: false })
        .replace("T", " ");

export const runTaskLogic = async (task: SchedulerTaskRow) => {
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
