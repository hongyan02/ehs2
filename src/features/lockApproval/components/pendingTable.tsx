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

export default function PendingApprovalTable({
  data,
  onView,
  selectedId,
}: PendingApprovalTableProps) {
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
        {data.length === 0 ? (
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
