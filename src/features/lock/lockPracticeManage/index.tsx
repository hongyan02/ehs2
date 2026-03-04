"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { PracticeSearchForm } from "./components/PracticeSearchForm";
import { PracticeTable } from "./components/PracticeTable";
import { ScoringDialog } from "./components/ScoringDialog";
import { LockAssignDialog } from "./components/LockAssignDialog";
import { usePracticeEligible, useSubmitPracticeResult } from "./query";
import { Button } from "@/components/ui/button";
import CustomPagination from "@/components/CustomPagination";
import { format } from "date-fns";
import useInfoStore from "@/stores/useUserInfo";

export interface Application {
  id: number;
  applicationCode: string;
  applicantName: string;
  applicantNo: string;
  department: string;
  phone: string;
  productionLine?: string | null;
  process?: string | null;
  team?: string | null;
  status: string;
  applicationTime: string;
  examResult?: {
    id: number;
    passed: number;
    score: number;
    examDate: string;
    practicePassed?: number;
    practiceScore?: number;
    practiceDate?: string;
  } | null;
}

export default function LockPracticeManage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<{
    applicantName?: string;
    applicantNo?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Dialog states
  const [scoringOpen, setScoringOpen] = useState(false);
  const [scoringApp, setScoringApp] = useState<Application | null>(null);
  const [tempScore, setTempScore] = useState(0);
  const [tempRemark, setTempRemark] = useState("");
  const [lockAssignOpen, setLockAssignOpen] = useState(false);
  const [lockAssignApp, setLockAssignApp] = useState<Application | null>(null);

  const { permissions } = useInfoStore();

  const { data, isLoading, refetch } = usePracticeEligible({
    page,
    pageSize,
    ...searchParams,
  });

  const submitResultMutation = useSubmitPracticeResult();

  const hasPermission = permissions.includes("LOCK_VIEW_ALL");

  const applicationList = useMemo(() => {
    return data?.data ?? [];
  }, [data]);

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    setPage(1);
  };

  const handleScore = (app: Application) => {
    setScoringApp(app);
    setScoringOpen(true);
  };

  const handlePass = (app: Application, score: number, remark: string) => {
    setScoringApp(app);
    setLockAssignApp(app);
    setTempScore(score);
    setTempRemark(remark);
    // 先关闭打分对话框，然后延迟打开锁具分配对话框
    setScoringOpen(false);
    setTimeout(() => {
      setLockAssignOpen(true);
    }, 100);
  };

  const handleFail = async (app: Application, score: number, remark: string) => {
    try {
      await submitResultMutation.mutateAsync({
        applicationId: app.id,
        passed: false,
        score,
        practiceDate: format(new Date(), "yyyy-MM-dd"),
        remark,
      });
      alert("提交成功");
      refetch();
    } catch (error) {
      console.error("Failed to submit practice result:", error);
      alert("提交失败，请重试");
    }
  };

  const handleLockAssign = async (
    app: Application,
    lockType: "red" | "yellow",
    lockQuantity: number,
    lockNumbers: string[]
  ) => {
    try {
      await submitResultMutation.mutateAsync({
        applicationId: app.id,
        passed: true,
        score: tempScore,
        practiceDate: format(new Date(), "yyyy-MM-dd"),
        remark: tempRemark,
        lockType,
        lockQuantity,
        lockNumbers,
      });
      alert("提交成功");
      refetch();
      setLockAssignOpen(false);
      setLockAssignApp(null);
      setScoringApp(null);
      setTempScore(0);
      setTempRemark("");
    } catch (error) {
      console.error("Failed to submit practice result:", error);
      alert("提交失败，请重试");
    }
  };

  const handleExport = () => {
    if (selectedIds.length === 0) {
      alert("请先选择要导出的记录");
      return;
    }
    // Filter selected applications
    const selectedApps = applicationList.filter((app: Application) =>
      selectedIds.includes(app.id)
    );

    // Generate CSV content
    const headers = ["申请单号", "姓名", "工号", "部门", "产线/工序/班组", "申请时间", "理论成绩"];
    const rows = selectedApps.map((app: Application) => [
      app.applicationCode,
      app.applicantName,
      app.applicantNo,
      app.department,
      [app.productionLine, app.process, app.team].filter(Boolean).join(" / "),
      app.applicationTime,
      app.examResult?.score ?? "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Download CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `实操考核名单_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasPermission) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-red-500">
          您没有权限查看此页面，请联系管理员开通权限
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PracticeSearchForm
        onSearch={handleSearch}
        selectedCount={selectedIds.length}
        onExport={handleExport}
      />

      <PracticeTable
        data={applicationList}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onScore={handleScore}
        loading={isLoading}
      />

      <CustomPagination
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={setPage}
        className="mt-4 justify-end"
      />

      {/* 打分对话框 */}
      <ScoringDialog
        open={scoringOpen}
        onOpenChange={setScoringOpen}
        application={scoringApp}
        onPass={handlePass}
        onFail={handleFail}
      />

      {/* 锁具分配对话框 */}
      <LockAssignDialog
        open={lockAssignOpen}
        onOpenChange={setLockAssignOpen}
        application={lockAssignApp}
        score={tempScore}
        onConfirm={handleLockAssign}
      />
    </div>
  );
}
