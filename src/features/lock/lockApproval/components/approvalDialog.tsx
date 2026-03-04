"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApprovalHistory, useLockApplication } from "../query";
import { Timeline } from "@/features/lock/components/Timeline";
import { LOCK_STATUS_TEXT } from "@/config/lock-status";

interface LockApplication {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone: string;
  productionLine?: string | null;
  process?: string | null;
  team?: string | null;
  certificatePhoto?: string | null;
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

export default function ApprovalDialog({
  open,
  onOpenChange,
  application,
  onApprove,
  onReject,
  isActionPending,
}: ApprovalDialogProps) {
  const [comment, setComment] = useState("");

  const { data: historyData, isLoading: historyLoading } = useApprovalHistory(
    application?.id || 0
  );

  const { data: examData } = useLockApplication(application?.id || 0);

  const approvalHistory = historyData?.data || [];
  const examResult = (examData as any)?.examResult || null;

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
                <span className="text-gray-500">所属产线：</span>
                {application.productionLine || "-"}
              </div>
              <div>
                <span className="text-gray-500">工序：</span>
                {application.process || "-"}
              </div>
              <div>
                <span className="text-gray-500">班组：</span>
                {application.team || "-"}
              </div>
              <div>
                <span className="text-gray-500">状态：</span>
                {LOCK_STATUS_TEXT[application.status as keyof typeof LOCK_STATUS_TEXT] || application.status}
              </div>
            </div>
          </div>

          {/* Certificate Photo */}
          {application.certificatePhoto && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">上岗证照片</h3>
              <Image
                src={application.certificatePhoto}
                alt="上岗证"
                width={160}
                height={160}
                className="w-40 h-40 object-cover rounded border"
                unoptimized
              />
            </div>
          )}

          {/* Lock Details */}
          {application.lockDetails && application.lockDetails.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">锁具明细</h3>
              <div className="space-y-2">
                {application.lockDetails.map((lock) => (
                  <div key={lock.id} className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
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

          {/* Timeline */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">流程进度</h3>
            {historyLoading ? (
              <div className="text-center py-4 text-gray-500">加载中...</div>
            ) : (
              <Timeline
                approvalHistory={approvalHistory}
                examResult={examResult}
                status={application.status}
                applicationTime={application.applicationTime}
                currentApprovalLevel={application.currentApprovalLevel}
              />
            )}
          </div>

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
