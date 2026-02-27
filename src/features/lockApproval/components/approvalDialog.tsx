"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LockApplication {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone: string;
  applyUnit: string;
  status: string;
  currentApprovalLevel: number;
  applicationTime: string;
  lockDetails?: Array<{
    id: number;
    lockType: string;
    specification: string | null;
    quantity: number;
    purpose: string | null;
  }>;
}

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: LockApplication | null;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
  isActionPending?: boolean;
}

const STATUS_MAP: Record<string, string> = {
  submitted: "待组长审批",
  approval_l1: "组长审批中",
  approval_l2: "部门长审批中",
  approval_l3: "安环部审批中",
  exam_eligible: "可参加考试",
  exam_passed: "考试通过",
  registration: "登记表审批中",
  registered: "已登记入库",
  rejected: "已驳回",
};

const LEVEL_NAMES: Record<number, string> = {
  1: "组长/主管",
  2: "部门长",
  3: "安环部",
  4: "登记审批",
};

export default function ApprovalDialog({
  open,
  onOpenChange,
  application,
  onApprove,
  onReject,
  isActionPending,
}: ApprovalDialogProps) {
  const [comment, setComment] = useState("");

  if (!application) return null;

  const handleApprove = () => {
    onApprove(comment);
    setComment("");
  };

  const handleReject = () => {
    onReject(comment);
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>申请单详情 - {application.applicationCode}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Applicant Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">申请人信息</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">姓名：</span>
                {application.applicantName}
              </div>
              <div>
                <span className="text-gray-500">工号：</span>
                {application.applicantNo}
              </div>
              <div>
                <span className="text-gray-500">部门：</span>
                {application.department}
              </div>
              <div>
                <span className="text-gray-500">电话：</span>
                {application.phone}
              </div>
              <div>
                <span className="text-gray-500">申请单位：</span>
                {application.applyUnit}
              </div>
              <div>
                <span className="text-gray-500">状态：</span>
                {STATUS_MAP[application.status]}
              </div>
            </div>
          </div>

          {/* Lock Details */}
          {application.lockDetails && application.lockDetails.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">锁具明细</h3>
              <div className="space-y-2">
                {application.lockDetails.map((lock, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                    <div>
                      <span className="text-gray-500">类型：</span>
                      {lock.lockType}
                    </div>
                    <div>
                      <span className="text-gray-500">规格：</span>
                      {lock.specification || "-"}
                    </div>
                    <div>
                      <span className="text-gray-500">数量：</span>
                      {lock.quantity}
                    </div>
                    <div>
                      <span className="text-gray-500">用途：</span>
                      {lock.purpose || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval Comment */}
          <div className="space-y-2">
            <Label>审批意见</Label>
            <Textarea
              placeholder="请输入审批意见（可选）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isActionPending}
            >
              驳回
            </Button>
            <Button onClick={handleApprove} disabled={isActionPending}>
              通过
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
