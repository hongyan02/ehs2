"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Application } from "../index";
import { generateLockNumber } from "../query/api";
import { Loader2 } from "lucide-react";

interface LockAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  score: number;
  onConfirm: (application: Application, lockType: "red" | "yellow", lockQuantity: number, lockNumbers: string[]) => void;
}

export function LockAssignDialog({
  open,
  onOpenChange,
  application,
  score,
  onConfirm,
}: LockAssignDialogProps) {
  const [lockType, setLockType] = useState<"red" | "yellow">("red");
  const [lockQuantity, setLockQuantity] = useState("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);

  // When lock type changes, generate lock numbers
  useEffect(() => {
    if (!open) return;

    // If no process, just generate placeholder numbers
    if (!application?.process) {
      const quantity = parseInt(lockQuantity, 10);
      if (isNaN(quantity) || quantity < 1) return;

      const numbers: string[] = [];
      for (let i = 0; i < quantity; i++) {
        // Generate placeholder number like "LOCK-日期-序号"
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        numbers.push(`LOCK-${date}-${i + 1}`);
      }
      setGeneratedNumbers(numbers);
      return;
    }

    const generateNumbers = async () => {
      const quantity = parseInt(lockQuantity, 10);
      if (isNaN(quantity) || quantity < 1) return;

      setIsGenerating(true);
      try {
        const numbers: string[] = [];
        for (let i = 0; i < quantity; i++) {
          const response = await generateLockNumber(application.process!, lockType);
          if (response.data.success) {
            numbers.push(response.data.data.lockNumber);
          }
        }
        setGeneratedNumbers(numbers);
      } catch (error) {
        console.error("Failed to generate lock numbers:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    // Debounce the generation
    const timer = setTimeout(generateNumbers, 500);
    return () => clearTimeout(timer);
  }, [application?.process, lockType, lockQuantity, open]);

  const handleConfirm = () => {
    if (!application) return;
    const quantity = parseInt(lockQuantity, 10);
    if (isNaN(quantity) || quantity < 1) {
      alert("请输入有效的锁具数量");
      return;
    }
    if (generatedNumbers.length === 0) {
      alert("正在生成锁具编号，请稍候");
      return;
    }
    onConfirm(application, lockType, quantity, generatedNumbers);
    handleClose();
  };

  const handleClose = () => {
    setLockType("red");
    setLockQuantity("1");
    setGeneratedNumbers([]);
    onOpenChange(false);
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分配锁具</DialogTitle>
          <DialogDescription>
            为 {application.applicantName} 分配锁具
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
                <span className="text-gray-500">实操成绩：</span>
                {score} 分
              </div>
              {application.process && (
                <div>
                  <span className="text-gray-500">工序：</span>
                  {application.process}
                </div>
              )}
            </div>
          </div>

          {/* 锁具类型选择 */}
          <div className="space-y-2">
            <Label>锁具类型 *</Label>
            <Select
              value={lockType}
              onValueChange={(value) => setLockType(value as "red" | "yellow")}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择锁具类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">红锁</SelectItem>
                <SelectItem value="yellow">黄锁</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 锁具数量 */}
          <div className="space-y-2">
            <Label htmlFor="quantity">锁具数量 *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="请输入锁具数量"
              value={lockQuantity}
              onChange={(e) => setLockQuantity(e.target.value)}
            />
          </div>

          {/* 生成的锁具编号 */}
          {generatedNumbers.length > 0 && (
            <div className="space-y-2">
              <Label>锁具编号</Label>
              <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                {generatedNumbers.map((num, index) => (
                  <div key={index} className="font-mono">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">正在生成锁具编号...</span>
            </div>
          )}

          {/* 确认按钮 */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={isGenerating || generatedNumbers.length === 0}>
              确认分配
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
