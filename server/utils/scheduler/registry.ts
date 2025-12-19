import { sendDutyLeaderTextMessage } from "../../api/wxWork/dutyLog/services";
import { sendDutyScheduleWebhook } from "../../api/webhook/dutySchedule/services";
import { sendDutyLogInspectionWebhook } from "../../api/webhook/dutyInspection/services";
import { schedulerTask } from "../../db/schema";
import { type SupportedJobKey } from "./constants";

export type SchedulerTaskRow = typeof schedulerTask.$inferSelect;
export type JobHandler = (task: SchedulerTaskRow) => Promise<unknown>;

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

const getDateFromPayload = (payload: unknown, key: string): string | undefined => {
    if (payload && typeof payload === "object" && key in payload) {
        const value = (payload as Record<string, unknown>)[key];
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
            return value.trim();
        }
    }
    return undefined;
};

const getRangeLabelFromPayload = (payload: unknown): string | undefined => {
    if (payload && typeof payload === "object" && "rangeLabel" in payload) {
        const value = (payload as { rangeLabel?: unknown }).rangeLabel;
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }
    return undefined;
};

const getExtraMentionedListFromPayload = (payload: unknown): string[] | undefined => {
    if (!payload || typeof payload !== "object" || !("extraMentionedList" in payload)) {
        return undefined;
    }

    const value = (payload as { extraMentionedList?: unknown }).extraMentionedList;

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
    "send-duty-log-inspection-webhook": async (task) => {
        const payload = parsePayload(task.payload);
        const startDate = getDateFromPayload(payload, "startDate");
        const endDate = getDateFromPayload(payload, "endDate");
        const rangeLabel = getRangeLabelFromPayload(payload);
        const extraMentionedList = getExtraMentionedListFromPayload(payload);
        return sendDutyLogInspectionWebhook({
            startDate,
            endDate,
            rangeLabel,
            extraMentionedList,
        });
    },
};

export const getJobHandler = (jobKey: string): JobHandler | undefined =>
    jobHandlers[jobKey as SupportedJobKey];
