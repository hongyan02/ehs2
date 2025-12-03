import { db } from "@server/db/db";
import { materialStore } from "@server/db/schema";
import { eq, like, or, and, desc, sql } from "drizzle-orm";
import { createMaterialSchema, updateMaterialSchema, searchMaterialSchema } from "./schema";
import { z } from "zod";

export const getMaterialList = async (query: z.infer<typeof searchMaterialSchema>) => {
    const { materialName, materialCode, type, supplier, page, pageSize } = query;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (materialName) {
        conditions.push(like(materialStore.materialName, `%${materialName}%`));
    }
    if (materialCode) {
        conditions.push(like(materialStore.materialCode, `%${materialCode}%`));
    }
    if (type) {
        conditions.push(eq(materialStore.type, type));
    }
    if (supplier) {
        conditions.push(like(materialStore.supplier, `%${supplier}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(materialStore)
        .where(whereClause);

    const total = totalResult?.count || 0;

    const list = await db
        .select()
        .from(materialStore)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(materialStore.createTime));

    return { list, total, page, pageSize };
};

export const createMaterial = async (data: z.infer<typeof createMaterialSchema>) => {
    const now = new Date().toISOString().replace("T", " ").split(".")[0];
    return await db.insert(materialStore).values({
        ...data,
        createTime: now,
        updateTime: now,
    }).returning();
};

export const updateMaterial = async (id: number, data: z.infer<typeof updateMaterialSchema>) => {
    const now = new Date().toISOString().replace("T", " ").split(".")[0];
    return await db.update(materialStore).set({
        ...data,
        updateTime: now,
    }).where(eq(materialStore.id, id)).returning();
};

export const deleteMaterial = async (id: number) => {
    return await db.delete(materialStore).where(eq(materialStore.id, id)).returning();
};
