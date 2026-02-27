import { db } from "../../../db/db";
import { lockApplication, lockApproval } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

// Linear approval flow mapping:
// Level 1 (组长/主管): status = "submitted" 
// Level 2 (部门长): status = "approval_l1"
// Level 3 (安环部): status = "approval_l2"  
// Level 4 (登记审批): status = "exam_passed" -> registration

const APPROVAL_LEVEL_STATUS: Record<number, string> = {
  1: "submitted",
  2: "approval_l1",
  3: "approval_l2",
  4: "exam_passed",
};

const STATUS_MAP: Record<number, string> = {
  1: "approval_l1",
  2: "approval_l2",
  3: "approval_l3",
  4: "registration",
};

export async function submitApproval(
  approval: {
    applicationId: number;
    approvalLevel: number;
    status: string;
    comment: string | null;
    approver: string;
    approverNo: string;
    approvalTime: string;
    createTime: string;
  },
  level: number,
  action: "approve" | "reject"
) {
  const [approvalRecord] = await db.insert(lockApproval).values(approval).returning();

  let newStatus: string;
  let newLevel: number;

  if (action === "reject") {
    newStatus = "rejected";
    newLevel = level;
  } else {
    if (level < 4) {
      newStatus = STATUS_MAP[level + 1];
      newLevel = level + 1;
    } else {
      newStatus = "registered";
      newLevel = 5;
    }
  }

  await db
    .update(lockApplication)
    .set({
      status: newStatus,
      currentApprovalLevel: newLevel,
      updateTime: approval.createTime,
    })
    .where(eq(lockApplication.id, approval.applicationId));

  return approvalRecord;
}

export async function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const targetLevel = params?.level || 1;
  const targetStatus = APPROVAL_LEVEL_STATUS[targetLevel] || "submitted";
  
  const applications = await db
    .select()
    .from(lockApplication)
    .where(eq(lockApplication.status, targetStatus))
    .orderBy(desc(lockApplication.id))
    .limit(pageSize)
    .offset(offset);

  return {
    data: applications,
    total: applications.length,
    page,
    pageSize,
  };
}

export async function getApprovalHistory(applicationId: number) {
  const approvals = await db
    .select()
    .from(lockApproval)
    .where(eq(lockApproval.applicationId, applicationId))
    .orderBy(lockApproval.approvalLevel);

  return approvals;
}
