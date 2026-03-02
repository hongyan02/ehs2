import { db } from "../../../db/db";
import { lockConfig } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// 获取配置列表（支持按type筛选）
export async function getConfigs(type?: string) {
  if (type) {
    return db
      .select()
      .from(lockConfig)
      .where(eq(lockConfig.type, type))
      .orderBy(lockConfig.sortOrder, lockConfig.id);
  }
  return db.select().from(lockConfig).orderBy(lockConfig.type, lockConfig.sortOrder, lockConfig.id);
}

// 获取工序配置（含审批人绑定）
export async function getProcessConfigs() {
  return db
    .select()
    .from(lockConfig)
    .where(eq(lockConfig.type, "process"))
    .orderBy(lockConfig.sortOrder, lockConfig.id);
}

// 根据工序名称获取配置
export async function getProcessConfigByName(processName: string) {
  const result = await db
    .select()
    .from(lockConfig)
    .where(and(eq(lockConfig.type, "process"), eq(lockConfig.name, processName)))
    .limit(1);
  return result[0] || null;
}

// 创建配置
export async function createConfig(data: {
  type: string;
  name: string;
  code?: string;
  processId?: number;
  managerName?: string;
  managerNo?: string;
  safetyEngineerName?: string;
  safetyEngineerNo?: string;
  sortOrder?: number;
  status?: number;
}) {
  const now = new Date().toISOString();
  const [config] = await db
    .insert(lockConfig)
    .values({
      ...data,
      status: data.status ?? 1,
      sortOrder: data.sortOrder ?? 0,
      createTime: now,
      updateTime: now,
    })
    .returning();
  return config;
}

// 更新配置
export async function updateConfig(
  id: number,
  data: {
    name?: string;
    code?: string;
    processId?: number;
    managerName?: string;
    managerNo?: string;
    safetyEngineerName?: string;
    safetyEngineerNo?: string;
    sortOrder?: number;
    status?: number;
  }
) {
  const [config] = await db
    .update(lockConfig)
    .set({
      ...data,
      updateTime: new Date().toISOString(),
    })
    .where(eq(lockConfig.id, id))
    .returning();
  return config;
}

// 删除配置
export async function deleteConfig(id: number) {
  const [config] = await db
    .delete(lockConfig)
    .where(eq(lockConfig.id, id))
    .returning();
  return config;
}
