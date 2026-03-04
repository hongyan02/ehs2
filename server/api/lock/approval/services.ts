import { db } from "../../../db/db";
import { lockApplication, lockApproval, systemApprover } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import {
  APPROVAL_LEVEL_STATUS,
  APPROVAL_STATUS_MAP,
  EXPECTED_STATUS_FOR_LEVEL,
  LOCK_APPLICATION_STATUS,
} from "../../../config/lock-status";

// 使用别名保持向后兼容
const STATUS_MAP = APPROVAL_STATUS_MAP;
const EXPECTED_STATUS = EXPECTED_STATUS_FOR_LEVEL;

// Helper function to check if user is in system approver table
async function checkSystemApprover(userNo: string): Promise<boolean> {
  const approvers = await db
    .select()
    .from(systemApprover)
    .where(eq(systemApprover.status, 1));
  return approvers.some((o) => o.no === userNo);
}

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
      // 组长/主管审批 - 只能通过申请中指定的工号校验
      if (application.leaderNo && application.leaderNo === userNo) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的组长/主管审批人，无权审批" };

    case 2:
      // 部门长审批 - 只能通过申请中指定的工号校验
      if (application.managerNo && application.managerNo === userNo) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的部门长审批人，无权审批" };

    case 3:
      // 安环部审批 - 支持两种方式：
      // 1. 申请中指定的安环部审批人
      // 2. 系统审批人员表中 module='lock' 的人员
      if (application.safetyOfficerNo && application.safetyOfficerNo === userNo) {
        return { hasPermission: true };
      }
      if (await checkSystemApprover(userNo)) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是该申请的安环部审批人，无权审批" };

    case 4:
      // 登记审批 - 通过 system_approver 表校验
      if (await checkSystemApprover(userNo)) {
        return { hasPermission: true };
      }
      return { hasPermission: false, message: "您不是登记审批人，无权审批" };

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
  // Get application to validate status
  const application = await db.query.lockApplication.findFirst({
    where: eq(lockApplication.id, approval.applicationId),
  });

  if (!application) {
    throw new Error("申请不存在");
  }

  // Check if application is in a valid state for approval
  if (application.status === "rejected") {
    throw new Error("该申请已被驳回，无法审批");
  }
  if (application.status === "registered") {
    throw new Error("该申请已完成审批，无法重复审批");
  }

  // Validate approval level matches current application status (approval order check)
  const expectedStatus = EXPECTED_STATUS_FOR_LEVEL[level];
  if (expectedStatus && application.status !== expectedStatus) {
    const statusMessages: Record<string, string> = {
      submitted: "待组长审批",
      approval_l1: "组长审批中，请先完成组长审批",
      approval_l2: "部门长审批中，请先完成部门长审批",
      approval_l3: "安环部审批中，请先完成安环部审批",
      exam_eligible: "等待考试",
      exam_passed: "等待登记审批",
      registration: "登记审批中",
      registered: "已完成",
      rejected: "已驳回",
    };
    throw new Error(`审批顺序错误：当前申请${statusMessages[application.status] || application.status}`);
  }

  // Check if approval already exists for this level and application
  const existingApproval = await db.query.lockApproval.findFirst({
    where: and(
      eq(lockApproval.applicationId, approval.applicationId),
      eq(lockApproval.approvalLevel, level)
    ),
  });

  if (existingApproval) {
    throw new Error(`该级别审批已存在，无法重复提交`);
  }

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
}) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const targetLevel = params?.level;
  const userNo = params?.userNo;

  // 如果没有指定 level 且有 userNo，根据用户工号自动确定审批级别
  // 否则查询所有待审批记录（用于管理后台）
  let targetStatuses: string[];

  if (!targetLevel && userNo) {
    // 根据用户权限确定可见的审批级别
    // 需要查询多个状态，因为用户可能有多个审批角色
    targetStatuses = ["submitted", "approval_l1", "approval_l2", "exam_passed"];
  } else if (targetLevel === 4) {
    // Level 4 (登记审批)
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

    // Check if user is in system approver table (module='lock')
    const isSystemApprover = await checkSystemApprover(userNo);

    for (const app of applications) {
      // Level 1 (组长): status = "submitted"，需要 leaderNo 匹配
      if (app.status === "submitted" && app.leaderNo === userNo) {
        filtered.push(app);
      }
      // Level 2 (部门长): status = "approval_l1"，需要 managerNo 匹配
      else if (app.status === "approval_l1" && app.managerNo === userNo) {
        filtered.push(app);
      }
      // Level 3 (安环部): status = "approval_l2"，需要 safetyOfficerNo 匹配 或 系统审批表中人员
      else if (app.status === "approval_l2" && (app.safetyOfficerNo === userNo || isSystemApprover)) {
        filtered.push(app);
      }
      // Level 4 (登记审批): status = "exam_passed"，需要系统审批表中人员
      else if (app.status === "exam_passed" && isSystemApprover) {
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
