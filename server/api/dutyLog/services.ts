import { db } from "@server/db/db";
import { dutyLog } from "@server/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface GetDutyLogsParams {
    page?: number;
    pageSize?: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    shift?: number; // 0=白班，1=夜班
}

export interface CreateDutyLogParams {
    name: string;
    no: string;
    date: string; // YYYY-MM-DD
    shift: number; // 0=白班，1=夜班
    log: string;
    todo?: string;
    createTime: string;
    updateTime: string;
}

export interface UpdateDutyLogParams {
    id: number;
    name?: string;
    no?: string;
    date?: string;
    shift?: number;
    log?: string;
    todo?: string;
    updateTime: string;
}

/**
 * 获取值班日志列表（支持分页和过滤）
 */
export const getDutyLogs = async (params: GetDutyLogsParams) => {
    console.log("getDutyLogs called with params:", params);
    const { page = 1, pageSize = 10, startDate, endDate, shift } = params;

    try {
        // 构建查询条件
        const conditions = [];
        if (startDate) {
            conditions.push(gte(dutyLog.date, startDate));
        }
        if (endDate) {
            conditions.push(lte(dutyLog.date, endDate));
        }
        if (shift !== undefined) {
            conditions.push(eq(dutyLog.shift, shift));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        console.log("Where clause:", whereClause);

        // 查询总数 - 方法1：直接查询所有数据然后计数
        console.log("Querying all data for count...");
        const allData = await db
            .select()
            .from(dutyLog)
            .where(whereClause);
        const total = allData.length;
        console.log("Total records:", total);

        // 查询数据（分页）
        const offset = (page - 1) * pageSize;
        console.log("Querying paginated data...", { offset, limit: pageSize });
        const data = await db
            .select()
            .from(dutyLog)
            .where(whereClause)
            .orderBy(desc(dutyLog.date), desc(dutyLog.shift))
            .limit(pageSize)
            .offset(offset);
        console.log("Paginated data count:", data.length);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    } catch (error) {
        console.error("getDutyLogs service error:", error);
        throw error;
    }
};

/**
 * 根据ID获取单个值班日志
 */
export const getDutyLogById = async (id: number) => {
    const result = await db.select().from(dutyLog).where(eq(dutyLog.id, id));
    return result[0];
};

/**
 * 创建值班日志
 */
export const createDutyLog = async (params: CreateDutyLogParams) => {
    const result = await db.insert(dutyLog).values(params).returning();
    return result[0];
};

/**
 * 更新值班日志
 */
export const updateDutyLog = async (params: UpdateDutyLogParams) => {
    const { id, ...updateData } = params;
    const result = await db
        .update(dutyLog)
        .set(updateData)
        .where(eq(dutyLog.id, id))
        .returning();
    return result[0];
};

/**
 * 删除值班日志
 */
export const deleteDutyLog = async (id: number) => {
    const result = await db.delete(dutyLog).where(eq(dutyLog.id, id)).returning();
    return result[0];
};
