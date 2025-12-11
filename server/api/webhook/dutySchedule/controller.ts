import type { Context } from "hono";

import {
    sendDutyScheduleWebhook,
    type SendDutyScheduleWebhookParams,
} from "./services";

const parseShift = (value: unknown) => {
    if (value === undefined || value === null) return 0;

    if (value === 1 || value === "1") return 1;
    if (value === 0 || value === "0") return 0;

    const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
    if (Number.isInteger(parsed) && (parsed === 0 || parsed === 1)) {
        return parsed;
    }

    throw new Error("`shift` must be 0（白班）或 1（夜班）");
};

const parseDate = (value: unknown) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new Error("`date` must be a string in YYYY-MM-DD format");

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new Error("`date` must match YYYY-MM-DD");
    }

    return trimmed;
};

const parsePayload = (body: unknown): SendDutyScheduleWebhookParams => {
    if (!body || typeof body !== "object") {
        throw new Error("Request body must be a JSON object");
    }

    const { shift, content, date } = body as {
        shift?: unknown;
        content?: unknown;
        date?: unknown;
    };

    const parsedShift = parseShift(shift);
    const parsedContent =
        typeof content === "string" && content.trim().length > 0 ? content.trim() : undefined;
    const parsedDate = parseDate(date);

    return {
        shift: parsedShift,
        content: parsedContent,
        date: parsedDate,
    };
};

export const dutyScheduleWebhookController = async (c: Context) => {
    let payload: SendDutyScheduleWebhookParams;

    try {
        const body = await c.req.json();
        payload = parsePayload(body);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Invalid request payload";
        return c.json({ success: false, message }, 400);
    }

    try {
        const result = await sendDutyScheduleWebhook(payload);
        return c.json({ success: true, result });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to push duty schedule webhook";
        return c.json({ success: false, message }, 502);
    }
};
