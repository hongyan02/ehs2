"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import CustomPagination from "@/components/CustomPagination";
import PointLogTable from "./PointLogTable";
import RankingTable from "./RankingTable";
import PointLogDialog, { PointLogFormValues } from "./PointLogDialog";
import { useCreatePointLog, usePointLogList, usePointRanking } from "../query";
import dayjs from "dayjs";

export default function PointLogManagement() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [searchNo, setSearchNo] = useState("");
    const [searchMonth, setSearchMonth] = useState(dayjs().format("YYYY-MM")); // Default to current month

    const [dialogOpen, setDialogOpen] = useState(false);

    // Logs Query
    const { data: logsData, isLoading: logsLoading } = usePointLogList({
        page,
        pageSize,
        name: searchName,
        no: searchNo,
        month: searchMonth,
    });

    // Ranking Query - depends on Month
    const { data: rankingData, isLoading: rankingLoading } = usePointRanking(searchMonth);

    const createMutation = useCreatePointLog();

    const handleSubmit = async (values: PointLogFormValues) => {
        try {
            await createMutation.mutateAsync(values);
            toast.success("记录成功");
            setDialogOpen(false);
        } catch (error: any) {
            const msg = error?.response?.data?.message || "记录失败";
            if (Array.isArray(msg)) {
                toast.error(msg[0].message);
            } else {
                toast.error(msg);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Left Side: Logs */}
                <div className="flex-1 space-y-4 min-w-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input
                                type="month"
                                value={searchMonth}
                                onChange={(e) => setSearchMonth(e.target.value)}
                                className="w-40"
                            />
                            <Input
                                placeholder="搜索姓名"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-32"
                            />
                            <Input
                                placeholder="搜索工号"
                                value={searchNo}
                                onChange={(e) => setSearchNo(e.target.value)}
                                className="w-32"
                            />
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            记录积分
                        </Button>
                    </div>

                    <div className="border rounded-md">
                        <PointLogTable
                            data={logsData?.data?.data?.list || []}
                            isLoading={logsLoading}
                        />
                    </div>

                    <CustomPagination
                        page={page}
                        pageSize={pageSize}
                        total={logsData?.data?.data?.total || 0}
                        onChange={setPage}
                    />
                </div>

                {/* Right Side: Ranking */}
                <div className="w-full md:w-80 space-y-4 shrink-0">
                    <div className="font-semibold text-lg pb-2">
                        {searchMonth} 月度排行榜
                    </div>
                    <div className="border rounded-md bg-white">
                        <RankingTable
                            data={rankingData?.data?.data || []}
                            isLoading={rankingLoading}
                        />
                    </div>
                </div>
            </div>

            <PointLogDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
            />
        </div>
    );
}
