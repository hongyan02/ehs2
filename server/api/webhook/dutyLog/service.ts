import { htmlToText } from "html-to-text";
import { eq } from "drizzle-orm";

import { db } from "@server/db/db";
import { dutyLog, webhookConfig } from "@server/db/schema";

const SCENE_DUTY_LOG = "值班日志推送";

const DEFAULT_WEBHOOK_BASE_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";

export type DutyLogWebhookPayload = {
    dutyLogId: number;
};

export type WeComWebhookResponse = {
    errcode: number;
    errmsg: string;
    msgid?: string;
};

const buildWebhookUrl = (key: string) => {
    const baseUrl = (process.env.WEBHOOK_BASE_URL ?? DEFAULT_WEBHOOK_BASE_URL).trim();

    const url = new URL(baseUrl);
    url.searchParams.set("key", key.trim());
    return url.toString();
};

const getDutyLogRecord = async (dutyLogId: number) => {
    const result = await db.select().from(dutyLog).where(eq(dutyLog.id, dutyLogId));

    return result[0];
};

const getWebhookKey = async (scene: string) => {
    const result = await db
        .select({ webhookKey: webhookConfig.webhookKey })
        .from(webhookConfig)
        .where(eq(webhookConfig.scene, scene));

    return result[0]?.webhookKey;
};

const getMentionedList = (no: string) => {
    const trimmedNo = no.trim();

    if (!trimmedNo) {
        return ["@all"];
    }

    return [trimmedNo, "@all"];
};

const formatShift = (shift: number) => {
    if (shift === 0) return "白班";
    if (shift === 1) return "夜班";
    return String(shift);
};

const buildContent = (record: typeof dutyLog.$inferSelect) => {
    const logText = htmlToText(record.log, { wordwrap: false });

    const cleanedLog = logText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");

    return [
        "【安全值班日志】",
        `日期：${record.date}`,
        `班次：${formatShift(record.shift)}`,
        `姓名：${record.name}`,
        cleanedLog,
    ]
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");
};

export const sendDutyLogWebhook = async ({
    dutyLogId,
}: DutyLogWebhookPayload): Promise<WeComWebhookResponse> => {
    const key = await getWebhookKey(SCENE_DUTY_LOG);

    if (!key) {
        throw new Error(`Webhook key not found for scene: ${SCENE_DUTY_LOG}`);
    }

    const trimmedKey = key.trim();

    if (!trimmedKey) {
        throw new Error("Webhook key is required");
    }

    if (!Number.isInteger(dutyLogId) || dutyLogId <= 0) {
        throw new Error("Valid duty log id is required");
    }

    const record = await getDutyLogRecord(dutyLogId);

    if (!record) {
        throw new Error("Duty log not found");
    }

    const textContent = buildContent(record);

    if (!textContent) {
        throw new Error("Duty log content is empty");
    }

    const mentionedList = getMentionedList(record.no);

    const response = await fetch(buildWebhookUrl(trimmedKey), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            msgtype: "text",
            text: {
                content: textContent,
                mentioned_list: mentionedList,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(
            `WeCom webhook request failed with status ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as WeComWebhookResponse;

    if (typeof data.errcode !== "number") {
        throw new Error("Unexpected response from WeCom webhook");
    }

    if (data.errcode !== 0) {
        throw new Error(data.errmsg || "WeCom webhook returned an error");
    }

    return data;
};
