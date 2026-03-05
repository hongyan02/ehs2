"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LOCK_STATUS_TEXT, LOCK_STATUS_COLORS } from "@/config/lock-status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image } from "lucide-react";

interface ExamResult {
  id: number;
  passed: number;
  score: number;
  examDate: string;
  practicePassed?: number | null;
  practiceScore?: number | null;
  practiceDate?: string | null;
  screenshotUrl?: string | null;
}

interface Application {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone?: string | null;
  productionLine?: string | null;
  process?: string | null;
  team?: string | null;
  status: string;
  applicationTime: string;
  examResult?: ExamResult | null;
  lockDetails?: {
    id: number;
    lockNumber: string;
    lockType: string;
  }[];
}

interface PracticeRecordTableProps {
  data: Application[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  loading?: boolean;
}

export function PracticeRecordTable({
  data,
  selectedIds,
  onSelectionChange,
  loading,
}: PracticeRecordTableProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(data.map((item) => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  const getResultText = (examResult?: ExamResult | null) => {
    if (!examResult?.practicePassed) return "-";
    return examResult.practicePassed === 1 ? "通过" : "未通过";
  };

  const getResultBadgeClass = (examResult?: ExamResult | null) => {
    if (!examResult?.practicePassed) return "bg-gray-100";
    return examResult.practicePassed === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>申请单号</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>工号</TableHead>
            <TableHead>部门</TableHead>
            <TableHead>理论成绩</TableHead>
            <TableHead>理论成绩截图</TableHead>
            <TableHead>理论考试日期</TableHead>
            <TableHead>实操成绩</TableHead>
            <TableHead>实操考核日期</TableHead>
            <TableHead>考核结果</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                加载中...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                暂无考核记录
              </TableCell>
            </TableRow>
          ) : (
            data.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(app.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(app.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{app.applicationCode}</TableCell>
                <TableCell>{app.applicantName}</TableCell>
                <TableCell>{app.applicantNo}</TableCell>
                <TableCell>{app.department}</TableCell>
                <TableCell>{app.examResult?.score ?? "-"}</TableCell>
                <TableCell>
                  {app.examResult?.screenshotUrl ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewImage(app.examResult?.screenshotUrl || null)}
                    >
                      <Image className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{app.examResult?.examDate ?? "-"}</TableCell>
                <TableCell>{app.examResult?.practiceScore ?? "-"}</TableCell>
                <TableCell>{app.examResult?.practiceDate ?? "-"}</TableCell>
                <TableCell>
                  <Badge className={getResultBadgeClass(app.examResult)}>
                    {app.status === "practice_passed" ? "通过" : "未通过"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 图片预览对话框 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>理论成绩截图</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center overflow-auto">
            {previewImage && (
              <img
                src={previewImage}
                alt="理论成绩截图"
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
