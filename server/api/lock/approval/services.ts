import { db } from "../../../db/db";
import { lockApplication, lockApproval } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

// Status mapping
const STATUS_MAP: Record<number, string> = {
  1: "approval_l1",
  2: "approval_l2",
  3: "approval_l3",
  4: "registration",
};

const APPROVAL_LEVEL_MAP: Record<string, number> = {
  submitted: 1,
  approval_l1: 2,
  approval_l2: 3,
  approval_l3: 4,
  exam_eligible: 4,
  registration: 5,
  registered: 5,
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
  return await db.transaction(async (tx) => {
    // Insert approval record
    const [approvalRecord] = await tx.insert(lockApproval).values(approval).returning();

    // Update application status
    let newStatus: string;
    let newLevel: number;

    if (action === "reject") {
      newStatus = "rejected";
      newLevel = level;
    } else {
      // Move to next level
      if (level < 4) {
        newStatus = STATUS_MAP[level + 1];
        newLevel = level + 1;
      } else {
        // Final approval - goes to registration
        newStatus = "registration";
        newLevel = 5;
      }
    }

    await tx
      .update(lockApplication)
      .set({
        status: newStatus,
        currentApprovalLevel: newLevel,
        updateTime: approval.createTime,
      })
      .where(eq(lockApplication.id, approval.applicationId));

    return approvalRecord;
  });
}

export async function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Get applications where currentApprovalLevel matches the query (or defaults to level 1)
  const targetLevel = params?.level || 1;
  
  const applications = await db
    .select()
    .from(lockApplication)
    .where(eq(lockApplication.currentApprovalLevel, targetLevel))
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
