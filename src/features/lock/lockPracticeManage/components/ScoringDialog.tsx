"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import type { Application } from "../index";

interface ScoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onPass: (application: Application, score: number, remark: string) => void;
  onFail: (application: Application, score: number, remark: string) => void;
}

export function ScoringDialog({
  open,
  onOpenChange,
  application,
  onPass,
  onFail,
}: ScoringDialogProps) {
  const [score, setScore] = useState("");
  const [remark, setRemark] = useState("");

  const handlePass = () => {
    if (!application) return;
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("请输入有效的分数 (0-100)");
      return;
    }
    onPass(application, scoreNum, remark);
    handleClose();
  };

  const handleFail = () => {
    if (!application) return;
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("请输入有效的分数 (0-100)");
      return;
    }
    onFail(application, scoreNum, remark);
    handleClose();
  };

  const handleClose = () => {
    setScore("");
    setRemark("");
    onOpenChange(false);
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>实操考核打分</DialogTitle>
          <DialogDescription>
            为 {application.applicantName} 进行实操考核评分
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 申请人信息 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
                <span className="text-gray-500">产线/工序/班组：</span>
                {[application.productionLine, application.process, application.team]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">理论考试成绩：</span>
              {application.examResult?.score ?? "-"} 分
              {application.examResult?.examDate && (
                <span className="text-gray-400 ml-2">
                  (考试日期: {application.examResult.examDate})
                </span>
              )}
            </div>
          </div>

          {/* 分数输入 */}
          <div className="space-y-2">
            <Label htmlFor="score">实操分数 *</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              placeholder="请输入实操分数 (0-100)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              placeholder="请输入备注（可选）"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleFail}
              disabled={!score}
            >
              不通过
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handlePass}
              disabled={!score}
            >
              通过
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
