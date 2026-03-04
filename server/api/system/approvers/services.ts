import { db } from "../../../db/db";
import { systemApprover } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

// 获取审批人员列表
export async function getApprovers() {
  return db.select().from(systemApprover).orderBy(desc(systemApprover.id));
}

// 创建审批人员
export async function createApprover(data: {
  name: string;
  no: string;
  status?: number;
}) {
  const now = new Date().toISOString();
  const [approver] = await db
    .insert(systemApprover)
    .values({
      ...data,
      status: data.status ?? 1,
      createTime: now,
      updateTime: now,
    })
    .returning();
  return approver;
}

// 更新审批人员
export async function updateApprover(
  id: number,
  data: {
    name?: string;
    no?: string;
    status?: number;
  }
) {
  const [approver] = await db
    .update(systemApprover)
    .set({
      ...data,
      updateTime: new Date().toISOString(),
    })
    .where(eq(systemApprover.id, id))
    .returning();
  return approver;
}

// 删除审批人员
export async function deleteApprover(id: number) {
  const [approver] = await db
    .delete(systemApprover)
    .where(eq(systemApprover.id, id))
    .returning();
  return approver;
}
