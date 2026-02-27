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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomPagination from "@/components/CustomPagination";
import { useMyApplications } from "@/features/lockApplication/query/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_MAP: Record<string, string> = {
  submitted: "待组长审批",
  approval_l1: "待部门长审批",
  approval_l2: "待安环部审批",
  approval_l3: "待考试",
  exam_eligible: "待考试",
  exam_passed: "待登记审批",
  registration: "待登记审批",
  registered: "已登记入库",
  rejected: "已驳回",
};

interface Application {
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
  leaderName?: string;
  leaderNo?: string;
  managerName?: string;
  managerNo?: string;
  safetyOfficerName?: string;
  safetyOfficerNo?: string;
  approvalHistory?: Array<{
    id: number;
    approvalLevel: number;
    status: string;
    approver?: string;
    approverNo?: string;
    comment?: string;
    approvalTime?: string;
  }>;
}

export default function LockMyApplicationPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError } = useMyApplications({
    page,
    pageSize,
  });

  const applicationList = data?.data?.data ?? [];

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      approval_l1: "bg-yellow-100 text-yellow-800",
      approval_l2: "bg-orange-100 text-orange-800",
      approval_l3: "bg-purple-100 text-purple-800",
      exam_eligible: "bg-purple-100 text-purple-800",
      exam_passed: "bg-cyan-100 text-cyan-800",
      registration: "bg-cyan-100 text-cyan-800",
      registered: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={statusColors[status] || "bg-gray-100"}>
        {STATUS_MAP[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">

      {isLoading ? (
        <div className="py-10 text-center">加载中...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-500">加载失败，请稍后重试</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申请单号</TableHead>
                <TableHead>申请单位</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>申请时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicationList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无申请记录
                  </TableCell>
                </TableRow>
              ) : (
                applicationList.map((app: Application) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.applicationCode}</TableCell>
                    <TableCell>{app.applyUnit}</TableCell>
                    <TableCell>{app.department}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.applicationTime}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <CustomPagination
            page={page}
            pageSize={pageSize}
            total={data?.data?.total || 0}
            onChange={setPage}
            className="mt-4 justify-end"
          />
        </>
      )}

      {/* 详情对话框 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>申请详情 - {selectedApp?.applicationCode}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">申请人</label>
                  <p>{selectedApp.applicantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">申请人工号</label>
                  <p>{selectedApp.applicantNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">部门</label>
                  <p>{selectedApp.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">联系电话</label>
                  <p>{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">申请单位</label>
                  <p>{selectedApp.applyUnit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">状态</label>
                  <p>{getStatusBadge(selectedApp.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">申请时间</label>
                  <p>{selectedApp.applicationTime}</p>
                </div>
              </div>

              {/* 审批人信息 */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">审批人信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">组长/主管：</span>
                    {selectedApp.leaderName} ({selectedApp.leaderNo})
                  </div>
                  <div>
                    <span className="text-gray-500">部门长：</span>
                    {selectedApp.managerName} ({selectedApp.managerNo})
                  </div>
                  <div>
                    <span className="text-gray-500">安环部：</span>
                    {selectedApp.safetyOfficerName} ({selectedApp.safetyOfficerNo})
                  </div>
                </div>
              </div>

              {/* 审批历史 */}
              {selectedApp.approvalHistory && selectedApp.approvalHistory.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">审批记录</h3>
                  <div className="space-y-2">
                    {selectedApp.approvalHistory.map((approval) => (
                      <div key={approval.id} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>
                            第{approval.approvalLevel}级审批 -{" "}
                            {approval.status === "approve" ? "通过" : "驳回"}
                          </span>
                          <span className="text-gray-500">{approval.approvalTime}</span>
                        </div>
                        <div className="text-gray-600">
                          审批人: {approval.approver} ({approval.approverNo})
                        </div>
                        {approval.comment && (
                          <div className="text-gray-500">意见: {approval.comment}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
