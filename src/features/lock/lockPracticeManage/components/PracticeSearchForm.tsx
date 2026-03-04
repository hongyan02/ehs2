"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface PracticeSearchFormProps {
  onSearch: (params: {
    applicantName?: string;
    applicantNo?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  selectedCount: number;
  onExport: () => void;
}

export function PracticeSearchForm({ onSearch, selectedCount, onExport }: PracticeSearchFormProps) {
  const [applicantName, setApplicantName] = useState("");
  const [applicantNo, setApplicantNo] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSearch = () => {
    onSearch({
      applicantName: applicantName || undefined,
      applicantNo: applicantNo || undefined,
      department: department || undefined,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    });
  };

  const handleReset = () => {
    setApplicantName("");
    setApplicantNo("");
    setDepartment("");
    setStartDate(undefined);
    setEndDate(undefined);
    onSearch({});
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* 姓名 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">姓名</label>
        <Input
          placeholder="请输入"
          value={applicantName}
          onChange={(e) => setApplicantName(e.target.value)}
          className="w-30"
        />
      </div>

      {/* 工号 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">工号</label>
        <Input
          placeholder="请输入"
          value={applicantNo}
          onChange={(e) => setApplicantNo(e.target.value)}
          className="w-30"
        />
      </div>

      {/* 部门 */}
      {/* <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">部门</label>
        <Input
          placeholder="请输入"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-30"
        />
      </div> */}

      {/* 开始日期 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">开始日期</label>
        <DatePicker
          date={startDate}
          onSelect={setStartDate}
          placeholder="选择"
        />
      </div>

      {/* 结束日期 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">结束日期</label>
        <DatePicker
          date={endDate}
          onSelect={setEndDate}
          placeholder="选择"
        />
      </div>

      {/* 按钮和导出 */}
      <div className="flex items-center gap-2">
        <Button onClick={handleSearch}>搜索</Button>
        <Button variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button
          variant="outline"
          onClick={onExport}
          disabled={selectedCount === 0}
        >
          <Download className="w-4 h-4 mr-1" />
          导出 ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
