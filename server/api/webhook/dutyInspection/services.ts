import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@server/db/db";
import { dutyLog, dutySchedule, webhookConfig } from "@server/db/schema";

const SCENE_DUTY_LOG_INSPECTION = "值班日志稽查";

const DEFAULT_WEBHOOK_BASE_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";

export type DutyLogInspectionWebhookParams = {
    startDate?: string;
    endDate?: string;
    rangeLabel?: string;
    extraMentionedList?: string[];
};

export type WeComWebhookResponse = {
    errcode: number;
    errmsg: string;
    msgid?: string;
};

export type DutyLogInspectionResult = {
    startDate: string;
    endDate: string;
    totalLeaders: number;
    completedLeaders: number;
    missingLeaders: number;
    completionRate: number;
    mentionedList: string[];
    missingLeaderList: Array<{ name: string; no: string }>;
    response: WeComWebhookResponse;
};

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
        .where(eq(webhookConfig.scene, SCENE_DUTY_LOG_INSPECTION));

    return result[0]?.webhookKey;
};

const getTodayInShanghai = () =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

const addDays = (date: string, delta: number) => {
    const base = new Date(`${date}T00:00:00+08:00`);
    if (Number.isNaN(base.getTime())) {
        throw new Error("Invalid date format, expected YYYY-MM-DD");
    }
    base.setDate(base.getDate() + delta);
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(base);
};

const normalizeDateRange = (startDate?: string, endDate?: string) => {
    const normalizedEnd = endDate?.trim() || getTodayInShanghai();
    const normalizedStart = startDate?.trim() || addDays(normalizedEnd, -6);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedStart)) {
        throw new Error("startDate must be in YYYY-MM-DD format");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedEnd)) {
        throw new Error("endDate must be in YYYY-MM-DD format");
    }

    if (normalizedStart > normalizedEnd) {
        throw new Error("startDate must be before or equal to endDate");
    }

    return { startDate: normalizedStart, endDate: normalizedEnd };
};

const formatMonthDay = (date: string) => {
    const [, month, day] = date.split("-");
    if (!month || !day) return date;
    return `${Number(month)}月${Number(day)}日`;
};

const normalizeMentionedList = (list: string[]) => {
    const normalized = list
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    return Array.from(new Set(normalized));
};

const buildContent = ({
    endDate,
    completedLeaders,
    missingLeaders,
    completionRate,
    rangeLabel,
}: {
    endDate: string;
    completedLeaders: number;
    missingLeaders: number;
    completionRate: number;
    rangeLabel: string;
}) => {
    const endLabel = formatMonthDay(endDate);

    return [
        "各位领导，大家好。",
        "根据《8BU领导值班管理规定》要求，值班领导需在当日值班期间检查本单位安全生产情况，纠正违章作业，督查生产纪律，并于值班当日及时填写值班日志。",
        `截至${endLabel}晚，${rangeLabel}共有 ${completedLeaders} 位 值班领导已完成巡视并填写日志，另有 ${missingLeaders} 位领导尚未提交值班日志。目前履职完成率为 ${completionRate}%，请尚未提交值班日志的领导及时补充值班日志。`,
        "感谢大家的配合！",
    ].join("\n");
};

export const sendDutyLogInspectionWebhook = async (
    params: DutyLogInspectionWebhookParams = {}
): Promise<DutyLogInspectionResult> => {
    const webhookKey = await getWebhookKey();

    if (!webhookKey || !webhookKey.trim()) {
        throw new Error(`未配置场景「${SCENE_DUTY_LOG_INSPECTION}」的 Webhook Key`);
    }

    const { startDate, endDate } = normalizeDateRange(params.startDate, params.endDate);
    const rangeLabel = params.rangeLabel?.trim() || "上周";

    const schedules = await db
        .select()
        .from(dutySchedule)
        .where(
            and(
                gte(dutySchedule.date, startDate),
                lte(dutySchedule.date, endDate),
                eq(dutySchedule.position, "值班领导")
            )
        );

    if (schedules.length === 0) {
        throw new Error("稽查范围内未找到值班领导排班信息");
    }

    const logs = await db
        .select({
            date: dutyLog.date,
            shift: dutyLog.shift,
            no: dutyLog.no,
        })
        .from(dutyLog)
        .where(and(gte(dutyLog.date, startDate), lte(dutyLog.date, endDate)));

    const logKeys = new Set(
        logs.map((log) => `${log.date}-${log.shift}-${(log.no ?? "").trim()}`)
    );

    const allLeaders = new Map<string, string>();
    const missingLeaders = new Map<string, string>();

    schedules.forEach((schedule) => {
        const no = schedule.no.trim();
        const name = schedule.name.trim();
        if (!no) return;

        allLeaders.set(no, name || no);

        const key = `${schedule.date}-${schedule.shift}-${no}`;
        if (!logKeys.has(key)) {
            missingLeaders.set(no, name || no);
        }
    });

    const totalLeaders = allLeaders.size;
    const missingCount = missingLeaders.size;
    const completedCount = Math.max(totalLeaders - missingCount, 0);
    const completionRate = totalLeaders > 0
        ? Math.round((completedCount / totalLeaders) * 100)
        : 0;

    const extraMentionedList = params.extraMentionedList ?? [];
    const mentionedList = normalizeMentionedList([
        ...missingLeaders.keys(),
        ...extraMentionedList,
    ]);

    const finalMentionedList = mentionedList.length > 0 ? mentionedList : ["@all"];

    const content = buildContent({
        endDate,
        completedLeaders: completedCount,
        missingLeaders: missingCount,
        completionRate,
        rangeLabel,
    });

    const response = await fetch(buildWebhookUrl(webhookKey), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            msgtype: "text",
            text: {
                content,
                mentioned_list: finalMentionedList,
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
        startDate,
        endDate,
        totalLeaders,
        completedLeaders: completedCount,
        missingLeaders: missingCount,
        completionRate,
        mentionedList: finalMentionedList,
        missingLeaderList: Array.from(missingLeaders, ([no, name]) => ({ no, name })),
        response: data,
    };
};
