import { Context } from "hono";
import { z } from "zod";
import { submitApproval, getPendingApprovals, getApprovalHistory, verifyApprovalPermission } from "./services";

// Submit approval schema
const approvalSchema = z.object({
  applicationId: z.number(),
  status: z.enum(["approve", "reject"]),
  comment: z.string().optional(),
  approvalLevel: z.number().min(1).max(4),
  approverName: z.string().optional(),
});

// Query schema
const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  level: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

// Helper: get current time string
const getCurrentTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const submitApprovalController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validated = approvalSchema.parse(body);

    // Get user from context (would be set by auth middleware)
    const user = c.get("user") || { name: "Unknown", employeeId: "UNKNOWN" };
    const userNo = user.employeeId || "UNKNOWN";

    // Check permission based on approval level
    if (validated.approvalLevel < 4) {
      const permissionCheck = await verifyApprovalPermission(
        validated.applicationId,
        validated.approvalLevel,
        userNo
      );
      if (!permissionCheck.hasPermission) {
        return c.json({ success: false, message: permissionCheck.message }, 403);
      }
    }

    const approvalRecord = {
      applicationId: validated.applicationId,
      approvalLevel: validated.approvalLevel,
      status: validated.status,
      comment: validated.comment || null,
      approver: validated.approverName || user.nickname || user.name || "Unknown",
      approverNo: userNo,
      approvalTime: getCurrentTimeString(),
      createTime: getCurrentTimeString(),
    };

    const result = await submitApproval(approvalRecord, validated.approvalLevel, validated.status);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("submitApprovalController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const getPendingApprovalsController = async (c: Context) => {
  try {
    const params = querySchema.parse(c.req.query());

    // Get user from context - check if user is authenticated
    const user = c.get("user");
    const userNo = user?.employeeId;

    // Check if user has LOCK_REGISTRATION permission (for level 4)
    const userPermissions = user?.permissions || [];
    const hasRegistrationPermission = userPermissions.includes("LOCK_REGISTRATION");

    // 不传递默认 level，让后端根据用户工号自动确定审批级别
    // 如果传了 level 参数，则使用指定的级别（用于管理后台查看特定级别）
    const result = await getPendingApprovals({
      level: params.level, // 只有显式传递时才生效
      userNo: userNo || undefined,
      hasRegistrationPermission,
    });
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, message: error.issues }, 400);
    }
    console.error("getPendingApprovalsController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};

export const getApprovalHistoryController = async (c: Context) => {
  try {
    const applicationId = parseInt(c.req.param("applicationId"));
    if (Number.isNaN(applicationId)) {
      return c.json({ success: false, message: "无效的申请ID" }, 400);
    }

    const result = await getApprovalHistory(applicationId);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("getApprovalHistoryController error:", error);
    return c.json({ success: false, message: "服务器错误" }, 500);
  }
};
