import { db } from "../../../db/db";
import { lockInventory } from "../../../db/schema";
import { eq, and, sql, like, desc } from "drizzle-orm";

export interface InventorySearchParams {
  page?: number;
  pageSize?: number;
  lockType?: string;
  department?: string;
  holderName?: string;
  lockNumber?: string;
}

export async function getLockInventory(params?: InventorySearchParams) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params?.lockType) {
    conditions.push(eq(lockInventory.lockType, params.lockType));
  }
  if (params?.department) {
    conditions.push(eq(lockInventory.department, params.department));
  }
  if (params?.holderName) {
    conditions.push(sql`${lockInventory.holderName} LIKE ${'%' + params.holderName + '%'}`);
  }
  if (params?.lockNumber) {
    conditions.push(sql`${lockInventory.lockNumber} LIKE ${'%' + params.lockNumber + '%'}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(lockInventory)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  // Get inventory data
  const inventory = await db
    .select()
    .from(lockInventory)
    .where(whereClause)
    .orderBy(desc(lockInventory.id))
    .limit(pageSize)
    .offset(offset);

  return {
    data: inventory,
    total,
    page,
    pageSize,
  };
}

// Get all unique lock types for filter
export async function getLockTypeOptions() {
  const types = await db
    .selectDistinct({ lockType: lockInventory.lockType })
    .from(lockInventory);
  return types.map(t => t.lockType);
}

// Get all unique departments for filter
export async function getDepartmentOptions() {
  const departments = await db
    .selectDistinct({ department: lockInventory.department })
    .from(lockInventory);
  return departments.map(d => d.department);
}

// Update inventory status (for lock return)
export async function updateInventoryStatus(
  lockNumber: string,
  status: "in_use" | "returned" | "scrapped"
) {
  const currentTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const [result] = await db
    .update(lockInventory)
    .set({
      status,
      updateTime: currentTime,
    })
    .where(eq(lockInventory.lockNumber, lockNumber))
    .returning();

  return result;
}
