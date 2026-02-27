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
import CustomPagination from "@/components/CustomPagination";
import { useAllLockDetails } from "@/features/lockApplication/query/api";
import useInfoStore from "@/stores/useUserInfo";

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

interface LockDetail {
  id: number;
  applicationCode: string;
  lockType: string;
  specification?: string;
  quantity: number;
  purpose?: string;
  holderName?: string;
  holderNo?: string;
  applicationDate?: string;
  applicationStatus?: string;
}

export default function LockInventoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { permissions } = useInfoStore();

  const { data, isLoading, isError } = useAllLockDetails({
    page,
    pageSize,
  });

  const lockList = data?.data?.data ?? [];

  // Check if user has permission
  const hasPermission = permissions.includes("LOCK_VIEW_ALL");

  if (!hasPermission) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">锁具库存</h1>
        <div className="text-center py-10 text-red-500">
          您没有权限查看此页面，请联系管理员开通权限
        </div>
      </div>
    );
  }

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
                <TableHead>锁具类型</TableHead>
                <TableHead>规格型号</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>用途说明</TableHead>
                <TableHead>持有人</TableHead>
                <TableHead>持有人工号</TableHead>
                <TableHead>申请日期</TableHead>
                <TableHead>申请状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lockList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    暂无锁具记录
                  </TableCell>
                </TableRow>
              ) : (
                lockList.map((lock: LockDetail) => (
                  <TableRow key={lock.id}>
                    <TableCell>{lock.applicationCode}</TableCell>
                    <TableCell>{lock.lockType}</TableCell>
                    <TableCell>{lock.specification || "-"}</TableCell>
                    <TableCell>{lock.quantity}</TableCell>
                    <TableCell>{lock.purpose || "-"}</TableCell>
                    <TableCell>{lock.holderName || "-"}</TableCell>
                    <TableCell>{lock.holderNo || "-"}</TableCell>
                    <TableCell>{lock.applicationDate || "-"}</TableCell>
                    <TableCell>
                      {lock.applicationStatus
                        ? STATUS_MAP[lock.applicationStatus] || lock.applicationStatus
                        : "-"}
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
    </div>
  );
}
