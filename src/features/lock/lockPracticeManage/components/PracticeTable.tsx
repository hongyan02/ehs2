"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LOCK_STATUS_TEXT, LOCK_STATUS_COLORS } from "@/config/lock-status";
import type { Application } from "../index";

interface PracticeTableProps {
  data: Application[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onScore: (app: Application) => void;
  loading?: boolean;
}

export function PracticeTable({
  data,
  selectedIds,
  onSelectionChange,
  onScore,
  loading,
}: PracticeTableProps) {
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

  return (
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
          <TableHead>产线/工序/班组</TableHead>
          <TableHead>申请时间</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>理论成绩</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8">
              加载中...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8">
              暂无待实操考核的人员
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
              <TableCell>
                {[app.productionLine, app.process, app.team]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </TableCell>
              <TableCell>{app.applicationTime}</TableCell>
              <TableCell>
                <Badge
                  className={
                    LOCK_STATUS_COLORS[app.status as keyof typeof LOCK_STATUS_COLORS] ||
                    "bg-gray-100"
                  }
                >
                  {LOCK_STATUS_TEXT[app.status as keyof typeof LOCK_STATUS_TEXT] ||
                    app.status}
                </Badge>
              </TableCell>
              <TableCell>
                {app.examResult?.score ?? "-"}
              </TableCell>
              <TableCell>
                <Button size="sm" onClick={() => onScore(app)}>
                  打分
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
