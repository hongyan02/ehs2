import { z } from "zod";

// ============================================
// Lock Application Shared Zod Schemas
// ============================================
// Used by both frontend (React Hook Form) and backend (Hono)
// Based on pattern from server/api/goods/application/controller.ts

// Helper: optional text with trim transform
const optionalText = z
  .string()
  .optional()
  .transform((val) => (val?.trim() ? val.trim() : undefined));

// ============================================
// Step 1: Applicant Basic Information
// ============================================
export const lockApplicationStep1Schema = z.object({
  // 申请人姓名
  applicantName: z.string().min(1, "申请人姓名不能为空"),

  // 申请人工号
  applicantNo: z.string().min(1, "申请人工号不能为空"),

  // 部门
  department: z.string().min(1, "部门不能为空"),

  // 联系电话
  phone: z.string().min(1, "联系电话不能为空").regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),

  // 所属产线
  productionLine: z.string().optional(),

  // 工序
  process: z.string().optional(),

  // 班组
  team: z.string().optional(),

  // 上岗证照片URL
  certificatePhoto: z.string().optional(),

  // 组长/主管
  leaderName: z.string().optional(),
  leaderNo: z.string().optional(),

  // 部门长
  managerName: z.string().optional(),
  managerNo: z.string().optional(),

  // 安环部审批人
  safetyOfficerName: z.string().optional(),
  safetyOfficerNo: z.string().optional(),
});

// ============================================
// Step 2: Lock Details
// ============================================
export const lockApplicationStep2Schema = z.object({
  // 锁具类型
  lockType: z.enum(["普通锁", "防爆锁", "电气锁", "机械锁", "其他"], {
    message: "请选择锁具类型",
  }),
  
  // 规格型号
  specification: optionalText,
  
  // 数量
  quantity: z
    .number()
    .min(1, "数量至少为1"),
  
  // 用途说明
  purpose: optionalText,
});

// Multiple locks support
export const lockDetailsSchema = z.array(lockApplicationStep2Schema).min(1, "至少添加一种锁具");

// ============================================
// Complete Application Submit
// ============================================
export const lockApplicationSubmitSchema = z.object({
  // Step 1 data
  applicantName: z.string().min(1, "申请人姓名不能为空"),
  applicantNo: z.string().min(1, "申请人工号不能为空"),
  department: z.string().min(1, "部门不能为空"),
  phone: z.string().min(1, "联系电话不能为空").regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),

  // 所属产线
  productionLine: z.string().optional(),

  // 工序
  process: z.string().optional(),

  // 班组
  team: z.string().optional(),

  // 上岗证照片URL
  certificatePhoto: z.string().optional(),

  // 组长/主管
  leaderName: z.string().optional(),
  leaderNo: z.string().optional(),

  // 部门长
  managerName: z.string().optional(),
  managerNo: z.string().optional(),

  // 安环部审批人
  safetyOfficerName: z.string().optional(),
  safetyOfficerNo: z.string().optional(),

  // Step 2 data - lock details array
  lockDetails: z.array(lockApplicationStep2Schema).min(1, "至少添加一种锁具"),
});

// ============================================
// Exam Result Schema
// ============================================
export const examResultSchema = z.object({
  // 申请ID
  applicationId: z.number(),
  
  // 是否通过
  passed: z.boolean(),
  
  // 考试分数
  score: z
    .number()
    .min(0, "分数不能小于0")
    .max(100, "分数不能大于100"),
  
  // 考试日期
  examDate: z.string().min(1, "考试日期不能为空"),
  
  // 备注
  remark: optionalText,
});

// ============================================
// Approval Schema
// ============================================
export const approvalSchema = z.object({
  // 申请ID
  applicationId: z.number(),
  
  // 审批状态
  status: z.enum(["approve", "reject"], {
    message: "审批状态必须为 approve 或 reject",
  }),
  
  // 审批意见
  comment: optionalText,
  
  // 审批级别 (1=组长/主管, 2=部门长, 3=安环部, 4=登记审批)
  approvalLevel: z
    .number()
    .min(1, "审批级别至少为1")
    .max(4, "审批级别最多为4"),
});

// ============================================
// Approval Status Enum
// ============================================
export const approvalStatusEnum = z.enum([
  "pending",      // 待审批
  "approved",     // 已通过
  "rejected",     // 已驳回
]);

// ============================================
// Application Status Enum
// ============================================
export const applicationStatusEnum = z.enum([
  "draft",           // 草稿
  "submitted",       // 已提交（待组长审批）
  "approval_l1",     // 组长/主管审批中
  "approval_l2",     // 部门长审批中
  "approval_l3",     // 安环部审批中
  "exam_eligible",   // 可参加考试
  "exam_passed",     // 考试通过
  "registration",    // 登记表审批中
  "registered",      // 已登记入库
  "rejected",        // 已驳回
]);

// ============================================
// TypeScript Type Exports
// ============================================
export type LockApplicationStep1 = z.infer<typeof lockApplicationStep1Schema>;
export type LockApplicationStep2 = z.infer<typeof lockApplicationStep2Schema>;
export type LockDetails = z.infer<typeof lockDetailsSchema>;
export type LockApplicationSubmit = z.infer<typeof lockApplicationSubmitSchema>;
export type ExamResult = z.infer<typeof examResultSchema>;
export type Approval = z.infer<typeof approvalSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusEnum>;
export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
