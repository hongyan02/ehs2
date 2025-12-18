import { pgDb as db } from "@server/db/pg-db";
import { pointKpi } from "@server/db/pg-schema";
import { eq, and } from "drizzle-orm";

export async function getKpiList(year: string) {
    return await db.select().from(pointKpi).where(eq(pointKpi.year, year));
}

export async function syncKpiList(data: any[]) {
    // Assuming data is an array of KPI objects from the external API
    // We need to upsert each record based on username + year

    for (const item of data) {
        const year = item.nf || "2025"; // Default to 2025 if null
        const username = item.username;

        if (!username) continue;

        const kpiData = {
            username: username,
            nickname: item.nickName,
            year: year,
            jan: item.jan,
            feb: item.feb,
            mar: item.mar,
            apr: item.apr,
            may: item.may,
            jun: item.jun,
            jul: item.jul,
            aug: item.aug,
            sep: item.sep,
            oct: item.oct,
            nov: item.nov,
            dec: item.dect, // Map dect to dec
        };

        // Check if exists
        const existing = await db
            .select()
            .from(pointKpi)
            .where(and(eq(pointKpi.username, username), eq(pointKpi.year, year)))
            .limit(1);

        if (existing.length > 0) {
            // Update
            await db
                .update(pointKpi)
                .set(kpiData)
                .where(eq(pointKpi.id, existing[0].id));
        } else {
            // Insert
            await db.insert(pointKpi).values(kpiData);
        }
    }

    return { success: true, count: data.length };
}

export async function createKpiRecord(data: typeof pointKpi.$inferInsert) {
    const result = await db.insert(pointKpi).values(data).returning();
    return result[0];
}

export async function updateKpiRecord(id: number, data: Partial<typeof pointKpi.$inferInsert>) {
    const result = await db.update(pointKpi).set(data).where(eq(pointKpi.id, id)).returning();
    return result[0];
}
