import { db } from "../../../db/db";
import { lockApplication, lockApproval } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// Linear approval flow mapping:
// Level 1 (组长/主管): status = "submitted" - waiting for level 1 approval
// Level 2 (部门长): status = "approval_l1" - waiting for level 2 approval
// Level 3 (安环部): status = "approval_l2" - waiting for level 3 approval
// Level 4 (登记审批): status = "exam_passed" - waiting for level 4 approval (after exam)

// APPROVAL_LEVEL_STATUS: 用于查询某个级别需要审批的申请（status值）
const APPROVAL_LEVEL_STATUS: Record<number, string> = {
  1: "submitted",   // Level 1 审批：查询 status = "submitted"
  2: "approval_l1", // Level 2 审批：查询 status = "approval_l1"
  3: "approval_l2", // Level 3 审批：查询 status = "approval_l2"
  4: "exam_passed", // Level 4 审批：查询 status = "exam_passed"
};

// STATUS_MAP: 审批通过后更新到的状态
const STATUS_MAP: Record<number, string> = {
  1: "approval_l1", // Level 1 通过 -> status 变为 "approval_l1"，等待 Level 2
  2: "approval_l2", // Level 2 通过 -> status 变为 "approval_l2"，等待 Level 3
  3: "approval_l3", // Level 3 通过 -> status 变为 "approval_l3"，等待考试
  4: "registration", // Level 4 通过 -> status 变为 "registration"，已完成
};

// Verify if user has permission to approve at a specific level
export async function verifyApprovalPermission(
  applicationId: number,
  approvalLevel: number,
  userNo: string
): Promise<{ hasPermission: boolean; message?: string }> {
  const application = await db.query.lockApplication.findFirst({
    where: eq(lockApplication.id, applicationId),
  });

  if (!application) {
    return { hasPermission: false, message: "申请不存在" };
  }

  switch (approvalLevel) {
    case 1:
      // 组长/主管审批 - 需要工号匹配
      if (application.leaderNo && application.leaderNo === userNo) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的组长/主管审批人，无权审批" };

    case 2:
      // 部门长审批 - 需要工号匹配
      if (application.managerNo && application.managerNo === userNo) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的部门长审批人，无权审批" };

    case 3:
      // 安环部审批 - 需要工号匹配
      if (application.safetyOfficerNo && application.safetyOfficerNo === userNo) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的安环部审批人，无权审批" };

    case 4:
      // 登记审批 - 需要特殊权限 (LOCK_REGISTRATION)
      // This is handled by checking user permissions in the controller
      return { hasPermission: true };

    default:
      return { hasPermission: false, message: "无效的审批级别" };
  }
}

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
      // 审批通过后，状态更新为下一个审批级别的待审批状态
      // Level 1 通过 -> status = "approval_l1" (等待 Level 2)
      // Level 2 通过 -> status = "approval_l2" (等待 Level 3)
      // Level 3 通过 -> status = "approval_l3" (等待考试)
      newStatus = STATUS_MAP[level];
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
  userNo?: string;
  hasRegistrationPermission?: boolean;
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const targetLevel = params?.level;
  const userNo = params?.userNo;
  const hasRegistrationPermission = params?.hasRegistrationPermission || false;

  // 如果没有指定 level 且有 userNo，根据用户工号自动确定审批级别
  // 否则查询所有待审批记录（用于管理后台）
  let targetStatuses: string[];

  if (!targetLevel && userNo) {
    // 根据用户权限确定可见的审批级别
    // 需要查询多个状态，因为用户可能有多个审批角色
    targetStatuses = ["submitted", "approval_l1", "approval_l2"];
  } else if (targetLevel === 4 && hasRegistrationPermission) {
    // Level 4 (登记审批) - 需要特殊权限
    targetStatuses = ["exam_passed"];
  } else if (targetLevel) {
    // 指定了具体的审批级别
    targetStatuses = [APPROVAL_LEVEL_STATUS[targetLevel] || "submitted"];
  } else {
    // 没有指定级别也没有 userNo，返回空
    return {
      data: [],
      total: 0,
      page,
      pageSize,
    };
  }

  // 查询所有匹配状态的应用
  let applications = await db
    .select()
    .from(lockApplication)
    .where(
      targetStatuses.length === 1
        ? eq(lockApplication.status, targetStatuses[0])
        : undefined // 需要用 in 查询
    )
    .orderBy(desc(lockApplication.id));

  // 如果目标状态是多个，用内存过滤
  if (targetStatuses.length > 1) {
    applications = applications.filter((app) =>
      targetStatuses.includes(app.status)
    );
  }

  // 根据用户权限过滤
  if (userNo) {
    const filtered: typeof applications = [];

    for (const app of applications) {
      // Level 1 (组长): status = "submitted"，需要 leaderNo 匹配
      if (app.status === "submitted" && app.leaderNo === userNo) {
        filtered.push(app);
      }
      // Level 2 (部门长): status = "approval_l1"，需要 managerNo 匹配
      else if (app.status === "approval_l1" && app.managerNo === userNo) {
        filtered.push(app);
      }
      // Level 3 (安环部): status = "approval_l2"，需要 safetyOfficerNo 匹配
      else if (app.status === "approval_l2" && app.safetyOfficerNo === userNo) {
        filtered.push(app);
      }
      // Level 4 (登记审批): status = "exam_passed"，需要特殊权限
      else if (app.status === "exam_passed" && hasRegistrationPermission) {
        filtered.push(app);
      }
    }

    applications = filtered;
  }

  // 应用分页
  const paginatedApplications = applications.slice(offset, offset + pageSize);

  return {
    data: paginatedApplications,
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
