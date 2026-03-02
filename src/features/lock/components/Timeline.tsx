"use client";

import { Circle, GraduationCap, ClipboardList, UserCheck, Building2, Shield, FileCheck } from "lucide-react";

interface ApprovalHistory {
  id: number;
  applicationId?: number;
  approvalLevel: number;
  status: string;
  approver?: string;
  approverNo?: string;
  comment?: string;
  approvalTime?: string;
}

interface ExamResult {
  id?: number;
  passed?: boolean;
  score?: number;
  examDate?: string;
}

type FlowStep = {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "pending" | "current" | "completed" | "rejected";
  time?: string;
  operator?: string;
  operatorNo?: string;
  comment?: string;
  extraInfo?: string;
};

interface TimelineProps {
  approvalHistory: ApprovalHistory[];
  examResult: ExamResult | null;
  status: string;
  applicationTime: string;
  currentApprovalLevel?: number;
}

// 根据状态获取当前审批层级
function getCurrentLevelFromStatus(status: string): number {
  switch (status) {
    case "submitted":
    case "approval_l1":
      return 1; // 组长审批中
    case "approval_l2":
      return 2; // 部门长审批中
    case "approval_l3":
      return 3; // 安环部审批中
    case "exam_eligible":
      return 4; // 学习考试中
    case "exam_passed":
      return 5; // 考试通过，待登记审批
    case "registration":
      return 6; // 登记审批中
    case "registered":
      return 7; // 已登记入库
    case "rejected":
      return -1; // 已驳回
    default:
      return 0;
  }
}

export function Timeline({ approvalHistory, examResult, status, applicationTime, currentApprovalLevel }: TimelineProps) {
  // 使用传入的 currentApprovalLevel 或根据 status 推断
  const currentLevel = currentApprovalLevel || getCurrentLevelFromStatus(status);

  // 检查是否有驳回记录
  const rejectedLevel = approvalHistory.find(h => h.status === "reject" || h.status === "rejected")?.approvalLevel;

  const buildTimeline = (): FlowStep[] => {
    const steps: FlowStep[] = [];
    const appStatus = status;

    // 1. 提交申请 - 始终显示
    steps.push({
      id: "submit",
      name: "提交申请",
      icon: <Circle className="w-5 h-5" />,
      status: "completed",
      time: applicationTime,
    });

    // 2. 组长审批
    const level1Approval = approvalHistory.find(h => h.approvalLevel === 1);
    const level1Status: "pending" | "current" | "completed" | "rejected" =
      level1Approval?.status === "reject" || level1Approval?.status === "rejected" ? "rejected" :
      level1Approval?.status === "approve" ? "completed" :
      rejectedLevel ? "pending" :
      currentLevel === 1 ? "current" :
      currentLevel > 1 ? "completed" :
      "pending";
    steps.push({
      id: "level1",
      name: "组长/主管审批",
      icon: <UserCheck className="w-5 h-5" />,
      status: level1Status,
      time: level1Approval?.approvalTime,
      operator: level1Approval?.approver,
      operatorNo: level1Approval?.approverNo,
      comment: level1Approval?.comment,
    });

    // 3. 部门长审批
    const level2Approval = approvalHistory.find(h => h.approvalLevel === 2);
    const level2Status: "pending" | "current" | "completed" | "rejected" =
      level2Approval?.status === "reject" || level2Approval?.status === "rejected" ? "rejected" :
      level2Approval?.status === "approve" ? "completed" :
      rejectedLevel ? "pending" :
      currentLevel === 2 ? "current" :
      currentLevel > 2 ? "completed" :
      "pending";
    steps.push({
      id: "level2",
      name: "部门长审批",
      icon: <Building2 className="w-5 h-5" />,
      status: level2Status,
      time: level2Approval?.approvalTime,
      operator: level2Approval?.approver,
      operatorNo: level2Approval?.approverNo,
      comment: level2Approval?.comment,
    });

    // 4. 安环部审批
    const level3Approval = approvalHistory.find(h => h.approvalLevel === 3);
    const level3Status: "pending" | "current" | "completed" | "rejected" =
      level3Approval?.status === "reject" || level3Approval?.status === "rejected" ? "rejected" :
      level3Approval?.status === "approve" ? "completed" :
      rejectedLevel ? "pending" :
      currentLevel === 3 ? "current" :
      currentLevel > 3 ? "completed" :
      "pending";
    steps.push({
      id: "level3",
      name: "安环部审批",
      icon: <Shield className="w-5 h-5" />,
      status: level3Status,
      time: level3Approval?.approvalTime,
      operator: level3Approval?.approver,
      operatorNo: level3Approval?.approverNo,
      comment: level3Approval?.comment,
    });

    // 5. 学习&考试
    const examStatus: "pending" | "current" | "completed" | "rejected" =
      appStatus === "exam_eligible" ? "current" :
      ["exam_passed", "registration", "registered"].includes(appStatus) ? "completed" :
      rejectedLevel ? "pending" :
      "pending";
    steps.push({
      id: "exam",
      name: "学习&考试",
      icon: <GraduationCap className="w-5 h-5" />,
      status: examStatus,
      extraInfo: examResult?.score !== undefined ? `分数: ${examResult.score}分 (${examResult.passed ? "通过" : "未通过"})` : undefined,
      time: examResult?.examDate,
    });

    // 6. 锁具登记审批
    const regApproval = approvalHistory.find(h => h.approvalLevel === 4);
    const regStatus: "pending" | "current" | "completed" | "rejected" =
      regApproval?.status === "reject" || regApproval?.status === "rejected" ? "rejected" :
      regApproval?.status === "approve" ? "completed" :
      appStatus === "registration" ? "current" :
      rejectedLevel ? "pending" :
      ["exam_passed", "registration", "registered"].includes(appStatus) ? "completed" :
      "pending";
    steps.push({
      id: "registration",
      name: "锁具登记审批",
      icon: <ClipboardList className="w-5 h-5" />,
      status: regStatus,
      time: regApproval?.approvalTime,
      operator: regApproval?.approver,
      operatorNo: regApproval?.approverNo,
      comment: regApproval?.comment,
    });

    // 7. 已登记入库 - 仅在完成时显示
    if (appStatus === "registered" && !rejectedLevel) {
      steps.push({
        id: "registered",
        name: "已登记入库",
        icon: <FileCheck className="w-5 h-5" />,
        status: "completed",
      });
    }

    return steps;
  };

  const timeline = buildTimeline();

  const getStatusColor = (stepStatus: FlowStep["status"]) => {
    switch (stepStatus) {
      case "completed":
        return "border-green-500 bg-green-50";
      case "current":
        return "border-blue-500 bg-blue-50";
      case "rejected":
        return "border-red-500 bg-red-50";
      case "pending":
        return "border-yellow-400 bg-yellow-50";
      default:
        return "border-yellow-400 bg-yellow-50";
    }
  };

  return (
    <div className="relative">
      {/* 垂直线 */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {timeline.map((step) => (
          <div key={step.id} className="relative flex gap-4">
            {/* 图标 */}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
              {step.icon}
            </div>

            {/* 内容 */}
            <div className={`flex-1 p-3 rounded-lg border ${getStatusColor(step.status)}`}>
              <div className="flex justify-between items-start">
                <div className="font-medium">{step.name}</div>
                <div className="text-xs text-gray-500">
                  {step.status === "completed" && "已完成"}
                  {step.status === "current" && "进行中"}
                  {step.status === "pending" && "待处理"}
                  {step.status === "rejected" && "已驳回"}
                </div>
              </div>

              {step.time && (
                <div className="text-xs text-gray-500 mt-1">
                  {step.time}
                </div>
              )}

              {step.operator && (
                <div className="text-xs text-gray-600 mt-1">
                  审批人: {step.operator} ({step.operatorNo || "-"})
                </div>
              )}

              {step.extraInfo && (
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  {step.extraInfo}
                </div>
              )}

              {step.comment && (
                <div className="text-xs text-gray-600 mt-1">
                  意见: {step.comment}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
