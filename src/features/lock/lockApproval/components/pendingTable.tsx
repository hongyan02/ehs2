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
}

interface PendingApprovalTableProps {
  data: LockApplication[];
  onView: (application: LockApplication) => void;
  selectedId?: number | null;
}

const STATUS_MAP: Record<string, string> = {
  submitted: "待组长审批",        // 等待组长审批
  approval_l1: "待部门长审批",    // 组长已通过，等待部门长审批
  approval_l2: "待安环部审批",    // 部门长已通过，等待安环部审批
  approval_l3: "待考试",          // 安环部已通过，等待考试
  exam_eligible: "待考试",        // 可以参加考试
  exam_passed: "待登记审批",      // 考试通过，等待登记审批
  registration: "待登记审批",     // 等待登记审批
  registered: "已登记入库",       // 已完成
  rejected: "已驳回",             // 已驳回
};

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
              <TableCell>{app.applyUnit}</TableCell>
              <TableCell>{STATUS_MAP[app.status] || app.status}</TableCell>
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
