"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LOCK_STATUS_TEXT } from "@/config/lock-status";

interface LockApplication {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone: string;
  applyUnit: string;
  productionLine?: string;
  process?: string;
  team?: string;
  status: string;
  currentApprovalLevel: number;
  applicationTime: string;
}

interface PendingApprovalTableProps {
  data: LockApplication[];
  onView: (application: LockApplication) => void;
  selectedId?: number | null;
}

export default function PendingApprovalTable({
  data,
  onView,
  selectedId,
}: PendingApprovalTableProps) {
  const isEmpty = !data || !Array.isArray(data) || data.length === 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>申请单号</TableHead>
          <TableHead>申请人</TableHead>
          <TableHead>部门</TableHead>
          <TableHead>申请单位</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>申请时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isEmpty ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              暂无待审批申请
            </TableCell>
          </TableRow>
        ) : (
          data.map((app) => (
            <TableRow
              key={app.id}
              data-selected={selectedId === app.id}
              className={selectedId === app.id ? "bg-blue-50" : ""}
            >
              <TableCell>{app.applicationCode}</TableCell>
              <TableCell>{app.applicantName}</TableCell>
              <TableCell>{app.department}</TableCell>
              <TableCell>{[app.productionLine, app.process, app.team].filter(Boolean).join(" / ") || "-"}</TableCell>
              <TableCell>{LOCK_STATUS_TEXT[app.status as keyof typeof LOCK_STATUS_TEXT] || app.status}</TableCell>
              <TableCell>{app.applicationTime}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onView(app)}>
                  查看
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
