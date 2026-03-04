/**
 * 锁具模块状态配置 - 前后端共用
 * 所有状态相关的常量都应在此文件中定义，保持统一
 */

// ============================================
// 状态定义
// ============================================

// 申请单状态
export const LOCK_APPLICATION_STATUS = {
  // 审批流程
  SUBMITTED: "submitted",              // 待组长审批
  APPROVAL_L1: "approval_l1",          // 组长审批中 - 待部门长审批
  APPROVAL_L2: "approval_l2",         // 部门长审批中 - 待安环部审批
  APPROVAL_L3: "approval_l3",          // 安环部审批中 - 待考试

  // 考试阶段
  EXAM_ELIGIBLE: "exam_eligible",      // 可参加考试
  EXAM_PASSED: "exam_passed",         // 考试通过 - 待实操考核

  // 实操考核阶段
  PRACTICE_ELIGIBLE: "practice_eligible", // 可申请实操考核
  PRACTICE_APPLYING: "practice_applying", // 已申请实操考核 - 待实操考核
  PRACTICE_PASSED: "practice_passed",  // 实操考核通过 - 待登记审批

  // 登记审批
  REGISTRATION: "registration",         // 登记审批中
  REGISTERED: "registered",             // 已登记入库

  // 结束状态
  REJECTED: "rejected",               // 已驳回
} as const;

export type LockApplicationStatus = typeof LOCK_APPLICATION_STATUS[keyof typeof LOCK_APPLICATION_STATUS];

// ============================================
// 状态中文描述
// ============================================

export const LOCK_STATUS_TEXT: Record<string, string> = {
  [LOCK_APPLICATION_STATUS.SUBMITTED]: "待组长审批",
  [LOCK_APPLICATION_STATUS.APPROVAL_L1]: "待部门长审批",
  [LOCK_APPLICATION_STATUS.APPROVAL_L2]: "待安环部审批",
  [LOCK_APPLICATION_STATUS.APPROVAL_L3]: "待考试",
  [LOCK_APPLICATION_STATUS.EXAM_ELIGIBLE]: "待考试",
  [LOCK_APPLICATION_STATUS.EXAM_PASSED]: "待实操考核",
  [LOCK_APPLICATION_STATUS.PRACTICE_ELIGIBLE]: "可申请实操",
  [LOCK_APPLICATION_STATUS.PRACTICE_APPLYING]: "待实操考核",
  [LOCK_APPLICATION_STATUS.PRACTICE_PASSED]: "待登记审批",
  [LOCK_APPLICATION_STATUS.REGISTRATION]: "待登记审批",
  [LOCK_APPLICATION_STATUS.REGISTERED]: "已登记入库",
  [LOCK_APPLICATION_STATUS.REJECTED]: "已驳回",
};

// ============================================
// 状态颜色（用于 Badge）- 前端专用
// ============================================

export const LOCK_STATUS_COLORS: Record<string, string> = {
  [LOCK_APPLICATION_STATUS.SUBMITTED]: "bg-blue-100 text-blue-800",
  [LOCK_APPLICATION_STATUS.APPROVAL_L1]: "bg-yellow-100 text-yellow-800",
  [LOCK_APPLICATION_STATUS.APPROVAL_L2]: "bg-orange-100 text-orange-800",
  [LOCK_APPLICATION_STATUS.APPROVAL_L3]: "bg-purple-100 text-purple-800",
  [LOCK_APPLICATION_STATUS.EXAM_ELIGIBLE]: "bg-purple-100 text-purple-800",
  [LOCK_APPLICATION_STATUS.EXAM_PASSED]: "bg-orange-100 text-orange-800",
  [LOCK_APPLICATION_STATUS.PRACTICE_ELIGIBLE]: "bg-blue-100 text-blue-800",
  [LOCK_APPLICATION_STATUS.PRACTICE_APPLYING]: "bg-orange-100 text-orange-800",
  [LOCK_APPLICATION_STATUS.PRACTICE_PASSED]: "bg-cyan-100 text-cyan-800",
  [LOCK_APPLICATION_STATUS.REGISTRATION]: "bg-cyan-100 text-cyan-800",
  [LOCK_APPLICATION_STATUS.REGISTERED]: "bg-green-100 text-green-800",
  [LOCK_APPLICATION_STATUS.REJECTED]: "bg-red-100 text-red-800",
};

// ============================================
// 审批级别
// ============================================

export const APPROVAL_LEVEL = {
  LEADER: 1,        // 组长/主管
  MANAGER: 2,       // 部门长
  SAFETY: 3,        // 安环部
  REGISTRATION: 4,  // 登记审批
} as const;

// ============================================
// 状态分组（哪些状态可以做什么操作）
// ============================================

// 可以参加考试的状态
export const CAN_TAKE_EXAM_STATUSES: string[] = [
  LOCK_APPLICATION_STATUS.APPROVAL_L3,
  LOCK_APPLICATION_STATUS.EXAM_ELIGIBLE,
];

// 可以申请实操考核的状态
export const CAN_APPLY_PRACTICE_STATUSES: string[] = [
  LOCK_APPLICATION_STATUS.EXAM_PASSED,
  LOCK_APPLICATION_STATUS.PRACTICE_ELIGIBLE,
];

// ============================================
// 审批相关配置 - 后端专用
// ============================================

// 审批级别对应的状态
export const APPROVAL_LEVEL_STATUS: Record<number, string> = {
  [APPROVAL_LEVEL.LEADER]: LOCK_APPLICATION_STATUS.SUBMITTED,
  [APPROVAL_LEVEL.MANAGER]: LOCK_APPLICATION_STATUS.APPROVAL_L1,
  [APPROVAL_LEVEL.SAFETY]: LOCK_APPLICATION_STATUS.APPROVAL_L2,
  [APPROVAL_LEVEL.REGISTRATION]: LOCK_APPLICATION_STATUS.PRACTICE_PASSED,
};

// 审批通过后更新的状态
export const APPROVAL_STATUS_MAP: Record<number, string> = {
  [APPROVAL_LEVEL.LEADER]: LOCK_APPLICATION_STATUS.APPROVAL_L1,
  [APPROVAL_LEVEL.MANAGER]: LOCK_APPLICATION_STATUS.APPROVAL_L2,
  [APPROVAL_LEVEL.SAFETY]: LOCK_APPLICATION_STATUS.EXAM_ELIGIBLE,
  [APPROVAL_LEVEL.REGISTRATION]: LOCK_APPLICATION_STATUS.REGISTRATION,
};

// 每个审批级别期望的状态
export const EXPECTED_STATUS_FOR_LEVEL: Record<number, string> = {
  [APPROVAL_LEVEL.LEADER]: LOCK_APPLICATION_STATUS.SUBMITTED,
  [APPROVAL_LEVEL.MANAGER]: LOCK_APPLICATION_STATUS.APPROVAL_L1,
  [APPROVAL_LEVEL.SAFETY]: LOCK_APPLICATION_STATUS.APPROVAL_L2,
  [APPROVAL_LEVEL.REGISTRATION]: LOCK_APPLICATION_STATUS.PRACTICE_PASSED,
};
