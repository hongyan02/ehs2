import { and, eq } from "drizzle-orm";

import { db } from "@server/db/db";
import { dutySchedule, webhookConfig } from "@server/db/schema";

const SCENE_DUTY_SCHEDULE = "领导带班通知";

const DEFAULT_WEBHOOK_BASE_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";

export type SendDutyScheduleWebhookParams = {
    shift?: number;
    content?: string;
    date?: string;
};

export type WeComWebhookResponse = {
    errcode: number;
    errmsg: string;
    msgid?: string;
};

export type DutyScheduleWebhookResult = {
    date: string;
    shift: number;
    content: string;
    mentionedList: string[];
    response: WeComWebhookResponse;
};

type DutyScheduleRecord = typeof dutySchedule.$inferSelect;

const buildWebhookUrl = (key: string) => {
    const baseUrl = (process.env.WEBHOOK_BASE_URL ?? DEFAULT_WEBHOOK_BASE_URL).trim();

    const url = new URL(baseUrl);
    url.searchParams.set("key", key.trim());
    return url.toString();
};

const getWebhookKey = async () => {
    const result = await db
        .select({ webhookKey: webhookConfig.webhookKey })
        .from(webhookConfig)
        .where(eq(webhookConfig.scene, SCENE_DUTY_SCHEDULE));

    return result[0]?.webhookKey;
};

const getTodayInShanghai = () =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

const normalizeShift = (shift?: number) => (shift === 1 ? 1 : 0);

const formatDateZh = (date: string) => {
    const [year, month, day] = date.split("-");
    if (year && month && day) {
        return `${year}年${String(Number(month))}月${String(Number(day))}日`;
    }
    return date;
};

const getDutyScheduleForShift = async (date: string, shift: number) => {
    const rows = await db
        .select()
        .from(dutySchedule)
        .where(and(eq(dutySchedule.date, date), eq(dutySchedule.shift, shift)));

    return rows;
};

const getNamesByPosition = (records: DutyScheduleRecord[], position: string) => {
    const names = records
        .filter((item) => (item.position ?? "").trim() === position)
        .map((item) => item.name.trim())
        .filter((item) => item.length > 0);

    if (names.length === 0) return "未排班";

    return names.join("、");
};

const buildDefaultContent = (records: DutyScheduleRecord[], date: string, shift: number) => {
    const shiftLabel = shift === 1 ? "夜班" : "白班";
    const timeRange = shift === 1 ? "20:30-08:30" : "8:30-20:30";

    const leader = getNamesByPosition(records, "值班领导");
    const cadre = getNamesByPosition(records, "带班干部");
    const manager = getNamesByPosition(records, "安全管理人员");
    const officer = getNamesByPosition(records, "安全员");

    return [
        "【8BU-60工厂领导带班通知】",
        `1、时间:${formatDateZh(date)} ${shiftLabel}（${timeRange}）`,
        `2、值班领导：${leader} 带班干部：${cadre} 安全管理人员：${manager} 安全员：${officer}`,
        "3、请值班领导做好值班巡视工作，如遇不可抗拒因素无法到岗的，必须提前指定好同级别或及高一级领导代理值班并及时反馈安环部；",
        "4、值班领导需要全程佩戴对讲机，必须佩戴袖标。对讲机由安环部提供；",
        "5、巡查要求:值班领导巡查期间，请重点对现场危险作业、施工现场、酒后上岗、携带火种进车间、网格员在岗情况等进行严格检查，并将检查出的问题如实记录在EHS系统上的在线日志中，并告知当班安全员进行督促整改；",
        "",
        "请值班领导到\"电芯消控室\"领取袖章、领导值班对讲机，安全管理人员、安全员向值班领导传达值班要求，陪同当日值班领导进行检查工作。",
        "注:应急对讲机频道是\"10\"频道。",
    ]
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");
};

const getMentionedList = (records: DutyScheduleRecord[]) => {
    const list = records
        .map((item) => item.no?.trim() ?? "")
        .filter((no) => no.length > 0);

    const unique = Array.from(new Set(list));

    return unique.length > 0 ? unique : ["@all"];
};

export const sendDutyScheduleWebhook = async (
    params: SendDutyScheduleWebhookParams = {}
): Promise<DutyScheduleWebhookResult> => {
    const webhookKey = await getWebhookKey();

    if (!webhookKey || !webhookKey.trim()) {
        throw new Error(`未配置场景「${SCENE_DUTY_SCHEDULE}」的 Webhook Key`);
    }

    const shift = normalizeShift(params.shift);
    const date = params.date?.trim() || getTodayInShanghai();

    const records = await getDutyScheduleForShift(date, shift);

    if (!records || records.length === 0) {
        throw new Error(`未找到${date} ${shift === 1 ? "夜班" : "白班"}的排班信息`);
    }

    const mentionedList = getMentionedList(records);

    const defaultContent = buildDefaultContent(records, date, shift);
    const contentToSend =
        params.content && params.content.trim().length > 0
            ? params.content.trim()
            : defaultContent;

    const response = await fetch(buildWebhookUrl(webhookKey), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            msgtype: "text",
            text: {
                content: contentToSend,
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

    return {
        date,
        shift,
        content: contentToSend,
        mentionedList,
        response: data,
    };
};
