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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/CustomPagination";
import { useLockInventory, useLockTypeOptions, useDepartmentOptions } from "@/features/lock/lockInventory/query";
import useInfoStore from "@/stores/useUserInfo";

interface LockInventoryItem {
  id: number;
  lockNumber: string;
  lockType: string;
  holderName: string;
  holderNo: string;
  department: string;
  applicationCode: string;
  status: string;
  registerTime: string;
}

const LOCK_STATUS_MAP: Record<string, string> = {
  in_use: "使用中",
  returned: "已归还",
  scrapped: "已报废",
};

export default function LockInventoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Search params
  const [searchParams, setSearchParams] = useState({
    lockType: "",
    department: "",
    holderName: "",
    lockNumber: "",
  });

  const { permissions } = useInfoStore();

  // Fetch filter options
  const { data: typeOptions } = useLockTypeOptions();
  const { data: departmentOptions } = useDepartmentOptions();

  // Fetch inventory data
  const { data, isLoading, isError, refetch } = useLockInventory({
    page,
    pageSize,
    lockType: searchParams.lockType || undefined,
    department: searchParams.department || undefined,
    holderName: searchParams.holderName || undefined,
    lockNumber: searchParams.lockNumber || undefined,
  });

  const lockList = data ?? [];

  // Check if user has permission
  const hasPermission = permissions.includes("LOCK_VIEW_ALL");

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleReset = () => {
    setSearchParams({
      lockType: "",
      department: "",
      holderName: "",
      lockNumber: "",
    });
    setPage(1);
  };

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
      {/* Search Form */}
      <div className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">锁具类别</label>
            <Select
              value={searchParams.lockType}
              onValueChange={(value) => setSearchParams({ ...searchParams, lockType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {typeOptions?.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type === "red" ? "红锁" : type === "yellow" ? "黄锁" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">部门</label>
            <Select
              value={searchParams.department}
              onValueChange={(value) => setSearchParams({ ...searchParams, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {departmentOptions?.map((dept: string) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">持有人</label>
            <Input
              placeholder="请输入持有人姓名"
              value={searchParams.holderName}
              onChange={(e) => setSearchParams({ ...searchParams, holderName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">锁具编号</label>
            <Input
              placeholder="请输入锁具编号"
              value={searchParams.lockNumber}
              onChange={(e) => setSearchParams({ ...searchParams, lockNumber: e.target.value })}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-10 text-center">加载中...</div>
      ) : isError ? (
        <div className="py-10 text-center text-red-500">加载失败，请稍后重试</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>锁具编号</TableHead>
                <TableHead>锁具类别</TableHead>
                <TableHead>部门</TableHead>
                <TableHead>持有人</TableHead>
                <TableHead>工号</TableHead>
                <TableHead>申请单号</TableHead>
                <TableHead>登记时间</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lockList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    暂无锁具记录
                  </TableCell>
                </TableRow>
              ) : (
                lockList.map((lock: LockInventoryItem) => (
                  <TableRow key={lock.id}>
                    <TableCell>{lock.lockNumber}</TableCell>
                    <TableCell>
                      {lock.lockType === "red" ? "红锁" : lock.lockType === "yellow" ? "黄锁" : lock.lockType}
                    </TableCell>
                    <TableCell>{lock.department}</TableCell>
                    <TableCell>{lock.holderName}</TableCell>
                    <TableCell>{lock.holderNo}</TableCell>
                    <TableCell>{lock.applicationCode}</TableCell>
                    <TableCell>{lock.registerTime ? lock.registerTime.slice(0, 10) : "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${lock.status === "in_use"
                          ? "bg-green-100 text-green-800"
                          : lock.status === "returned"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {LOCK_STATUS_MAP[lock.status] || lock.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <CustomPagination
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
            onChange={setPage}
            className="mt-4 justify-end"
          />
        </>
      )}
    </div>
  );
}
