import { db } from "@server/db/db";
import { pointCategories, pointEvent, pointLog, pointPerson } from "@server/db/schema";
import { and, desc, eq, like, sql } from "drizzle-orm";

// -------------------- Point Person Services --------------------

export interface GetPointPersonParams {
    name?: string;
    no?: string;
    active?: number;
    page?: number;
    pageSize?: number;
}

export const getPointPersonList = async (params: GetPointPersonParams) => {
    const { name, no, active, page = 1, pageSize = 10 } = params;
    const conditions = [];

    if (name) conditions.push(like(pointPerson.name, `%${name}%`));
    if (no) conditions.push(like(pointPerson.no, `%${no}%`));
    if (active !== undefined && active !== -1) conditions.push(eq(pointPerson.active, active));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pointPerson)
        .where(whereClause);

    const data = await db
        .select()
        .from(pointPerson)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(pointPerson.createdAt));

    return { total: totalResult.count, list: data };
};

export const createPointPerson = async (payload: typeof pointPerson.$inferInsert) => {
    const result = await db.insert(pointPerson).values(payload).returning();
    return result[0];
};

export const updatePointPerson = async (id: number, payload: Partial<typeof pointPerson.$inferInsert>) => {
    const result = await db.update(pointPerson).set(payload).where(eq(pointPerson.id, id)).returning();
    return result[0];
};

export const deletePointPerson = async (id: number) => {
    const result = await db.delete(pointPerson).where(eq(pointPerson.id, id)).returning();
    return result[0];
};

export const getPointPersonByNo = async (no: string) => {
    const result = await db.select().from(pointPerson).where(eq(pointPerson.no, no));
    return result[0];
};


// -------------------- Point Categories Services --------------------

export const getPointCategoriesList = async () => {
    return db.select().from(pointCategories).orderBy(desc(pointCategories.createdAt));
};

export const createPointCategory = async (payload: typeof pointCategories.$inferInsert) => {
    const result = await db.insert(pointCategories).values(payload).returning();
    return result[0];
};

export const updatePointCategory = async (id: number, payload: Partial<typeof pointCategories.$inferInsert>) => {
    const result = await db.update(pointCategories).set(payload).where(eq(pointCategories.id, id)).returning();
    return result[0];
};

export const deletePointCategory = async (id: number) => {
    const result = await db.delete(pointCategories).where(eq(pointCategories.id, id)).returning();
    return result[0];
};


// -------------------- Point Event Services --------------------

export interface GetPointEventParams {
    name?: string;
    categoryId?: number;
    page?: number;
    pageSize?: number;
}

export const getPointEventList = async (params: GetPointEventParams) => {
    const { name, categoryId, page = 1, pageSize = 10 } = params;
    const conditions = [];

    if (name) conditions.push(like(pointEvent.name, `%${name}%`));
    if (categoryId) conditions.push(eq(pointEvent.categoryId, categoryId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pointEvent)
        .where(whereClause);

    const data = await db
        .select({
            id: pointEvent.id,
            name: pointEvent.name,
            description: pointEvent.description,
            categoryId: pointEvent.categoryId,
            categoryName: pointCategories.categoryName,
            defaultPoint: pointEvent.defaultPoint,
            createdAt: pointEvent.createdAt,
            updatedAt: pointEvent.updatedAt,
        })
        .from(pointEvent)
        .leftJoin(pointCategories, eq(pointEvent.categoryId, pointCategories.id))
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(pointEvent.createdAt));

    return { total: totalResult.count, list: data };
};

export const createPointEvent = async (payload: typeof pointEvent.$inferInsert) => {
    const result = await db.insert(pointEvent).values(payload).returning();
    return result[0];
};

export const updatePointEvent = async (id: number, payload: Partial<typeof pointEvent.$inferInsert>) => {
    const result = await db.update(pointEvent).set(payload).where(eq(pointEvent.id, id)).returning();
    return result[0];
};

export const deletePointEvent = async (id: number) => {
    const result = await db.delete(pointEvent).where(eq(pointEvent.id, id)).returning();
    return result[0];
};


// -------------------- Point Log Services --------------------

export interface GetPointLogParams {
    no?: string;
    name?: string;
    month?: string;
    page?: number;
    pageSize?: number;
}

export const getPointLogList = async (params: GetPointLogParams) => {
    const { no, name, month, page = 1, pageSize = 10 } = params;
    const conditions = [];

    if (no) conditions.push(like(pointLog.no, `%${no}%`));
    if (name) conditions.push(like(pointLog.name, `%${name}%`));
    if (month) conditions.push(eq(pointLog.month, month));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pointLog)
        .where(whereClause);

    const data = await db
        .select()
        .from(pointLog)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(pointLog.createdAt));

    return { total: totalResult.count, list: data };
};

export const createPointLog = async (payload: typeof pointLog.$inferInsert) => {
    const result = await db.insert(pointLog).values(payload).returning();
    return result[0];
};

export const getMonthlyRanking = async (month: string) => {
    const result = await db
        .select({
            no: pointLog.no,
            name: pointLog.name,
            dept: pointLog.dept,
            totalPoints: sql<number>`sum(${pointLog.point})`,
        })
        .from(pointLog)
        .where(eq(pointLog.month, month))
        .groupBy(pointLog.no, pointLog.name, pointLog.dept)
        .orderBy(desc(sql`sum(${pointLog.point})`));
    return result;
};
