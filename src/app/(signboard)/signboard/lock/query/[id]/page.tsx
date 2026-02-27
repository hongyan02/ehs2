"use client";

import { useParams, useRouter } from "next/navigation";
import { useQueryByEmployeeNo } from "@/features/lockApplication/query/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  lockDetails?: Array<{
    id: number;
    lockType: string;
    specification?: string;
    quantity: number;
    purpose?: string;
  }>;
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

export default function LockQueryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeNo = params.id as string;

  const { data, isLoading, isError } = useQueryByEmployeeNo(employeeNo);
  const applications: Application[] = data?.data || [];

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

  const handleBack = () => {
    router.push("/signboard/lock");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-2">申请查询</h1>
      </div>

      {/* Employee No Info */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <p className="text-sm text-gray-500">查询工号</p>
        <p className="text-lg font-medium">{employeeNo}</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-10">加载中...</div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-10 text-red-500">
          加载失败，请稍后重试
        </div>
      )}

      {/* No Applications */}
      {!isLoading && !isError && applications.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <Lock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无申请记录</p>
        </div>
      )}

      {/* Applications List */}
      {!isLoading && !isError && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg p-4 shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{app.applicationCode}</p>
                    <p className="text-sm text-gray-500">{app.applicationTime}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">申请人：</span>
                    {app.applicantName}
                  </div>
                  <div>
                    <span className="text-gray-500">部门：</span>
                    {app.department}
                  </div>
                  <div>
                    <span className="text-gray-500">申请单位：</span>
                    {app.applyUnit}
                  </div>
                  <div>
                    <span className="text-gray-500">电话：</span>
                    {app.phone}
                  </div>
                </div>

                {/* Lock Details */}
                {app.lockDetails && app.lockDetails.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">锁具明细</p>
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead>类型</TableHead>
                          <TableHead>规格</TableHead>
                          <TableHead>数量</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {app.lockDetails.map((detail) => (
                          <TableRow key={detail.id}>
                            <TableCell>{detail.lockType}</TableCell>
                            <TableCell>{detail.specification || "-"}</TableCell>
                            <TableCell>{detail.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Approval History */}
                {app.approvalHistory && app.approvalHistory.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">审批记录</p>
                    <div className="space-y-1">
                      {app.approvalHistory.map((approval) => (
                        <div
                          key={approval.id}
                          className="text-xs bg-gray-50 p-2 rounded flex justify-between"
                        >
                          <span>
                            第{approval.approvalLevel}级 -{" "}
                            {approval.status === "approve" ? "通过" : "驳回"}
                          </span>
                          <span className="text-gray-500">
                            {approval.approver} {approval.approvalTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
