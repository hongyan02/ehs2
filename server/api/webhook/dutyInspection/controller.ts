import type { Context } from "hono";

import {
    sendDutyLogInspectionWebhook,
    type DutyLogInspectionWebhookParams,
} from "./services";

const parseDate = (value: unknown, field: string) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new Error(`${field} must be a string in YYYY-MM-DD format`);

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new Error(`${field} must match YYYY-MM-DD`);
    }

    return trimmed;
};

const parseStringList = (value: unknown, field: string) => {
    if (value === undefined || value === null) return undefined;

    if (Array.isArray(value)) {
        const list = value
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        return list.length > 0 ? list : undefined;
    }

    if (typeof value === "string") {
        const list = value
            .split(/[,\s]+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        return list.length > 0 ? list : undefined;
    }

    throw new Error(`${field} must be a string or string[]`);
};

const parseRangeLabel = (value: unknown) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new Error("rangeLabel must be a string");

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const parsePayload = (body: unknown): DutyLogInspectionWebhookParams => {
    if (!body || typeof body !== "object") {
        throw new Error("Request body must be a JSON object");
    }

    const { startDate, endDate, rangeLabel, extraMentionedList } = body as {
        startDate?: unknown;
        endDate?: unknown;
        rangeLabel?: unknown;
        extraMentionedList?: unknown;
    };

    return {
        startDate: parseDate(startDate, "startDate"),
        endDate: parseDate(endDate, "endDate"),
        rangeLabel: parseRangeLabel(rangeLabel),
        extraMentionedList: parseStringList(extraMentionedList, "extraMentionedList"),
    };
};

export const dutyInspectionWebhookController = async (c: Context) => {
    let payload: DutyLogInspectionWebhookParams;

    try {
        const body = await c.req.json();
        payload = parsePayload(body);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid request payload";
        return c.json({ success: false, message }, 400);
    }

    try {
        const result = await sendDutyLogInspectionWebhook(payload);
        return c.json({ success: true, result });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to push duty log inspection webhook";
        return c.json({ success: false, message }, 502);
    }
};
