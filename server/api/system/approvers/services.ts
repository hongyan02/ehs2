import { db } from "../../../db/db";
import { systemApprover } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// 获取审批人员列表（支持按module/role筛选）
export async function getApprovers(module?: string, role?: string) {
  let condition = undefined;

  if (module && role) {
    condition = and(eq(systemApprover.module, module), eq(systemApprover.role, role));
  } else if (module) {
    condition = eq(systemApprover.module, module);
  } else if (role) {
    condition = eq(systemApprover.role, role);
  }

  if (condition) {
    return db.select().from(systemApprover).where(condition).orderBy(systemApprover.id);
  }
  return db.select().from(systemApprover).orderBy(systemApprover.module, systemApprover.id);
}

// 根据module和role获取审批人员
export async function getApproversByModuleAndRole(module: string, role: string) {
  return db
    .select()
    .from(systemApprover)
    .where(and(eq(systemApprover.module, module), eq(systemApprover.role, role), eq(systemApprover.status, 1)));
}

// 检查工号是否在指定模块角色中
export async function isApprover(userNo: string, module: string, role: string): Promise<boolean> {
  const approvers = await getApproversByModuleAndRole(module, role);
  return approvers.some((a) => a.no === userNo);
}

// 创建审批人员
export async function createApprover(data: {
  name: string;
  no: string;
  module: string;
  role: string;
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
    module?: string;
    role?: string;
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
