"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LockPage() {
  const router = useRouter();
  const [queryNo, setQueryNo] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleApply = () => {
    router.push("/signboard/lock/apply");
  };

  const handleQuery = () => {
    if (!queryNo.trim()) {
      setSearchError("请输入工号");
      return;
    }
    setSearchError("");
    router.push(`/signboard/lock/query/${queryNo}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold text-center mb-6">锁具管理</h1>

      <div className="space-y-4">
        {/* 申请卡片 */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleApply}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">申请</h2>
              <p className="text-sm text-gray-500">填写申请表申请锁具</p>
            </div>
            <Button variant="outline">进入</Button>
          </div>
        </div>

        {/* 查询卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-3">查询</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="queryNo" className="text-sm">输入工号查询</Label>
              <Input
                id="queryNo"
                placeholder="请输入工号"
                value={queryNo}
                onChange={(e) => {
                  setQueryNo(e.target.value);
                  setSearchError("");
                }}
                className="mt-1"
              />
              {searchError && (
                <p className="text-sm text-red-500 mt-1">{searchError}</p>
              )}
            </div>
            <Button onClick={handleQuery} className="w-full">
              查询
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
