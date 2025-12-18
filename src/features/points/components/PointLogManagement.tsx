"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import CustomPagination from "@/components/CustomPagination";
import PointLogTable, { PointLog } from "./PointLogTable";
import PointLogDialog, { PointLogFormValues } from "./PointLogDialog";
import { useCreatePointLog, useDeletePointLog, usePointLogList } from "../query";
import dayjs from "dayjs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PointLogManagement() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [searchNo, setSearchNo] = useState("");
    const [searchMonth, setSearchMonth] = useState(dayjs().format("YYYY-MM")); // Default to current month

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PointLog | null>(null);

    // Logs Query
    const { data: logsData, isLoading: logsLoading } = usePointLogList({
        page,
        pageSize,
        name: searchName,
        no: searchNo,
        month: searchMonth,
    });


    // Kpi Query (from local DB)
    // const { data: kpiData } = useKpiRecords(searchMonth.split("-")[0]);

    const createMutation = useCreatePointLog();
    const deleteMutation = useDeletePointLog();

    const handleSubmit = async (values: PointLogFormValues) => {
        try {
            await createMutation.mutateAsync(values);
            toast.success("记录成功");
            setDialogOpen(false);
        } catch (error: any) {
            const msg = error?.data?.message || error?.response?.data?.message || "记录失败";
            if (Array.isArray(msg)) {
                toast.error(msg[0].message);
            } else {
                toast.error(msg);
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("删除成功");
            setDeleteTarget(null);
        } catch (error: any) {
            const msg = error?.data?.message || error?.response?.data?.message || "删除失败";
            if (Array.isArray(msg)) {
                toast.error(msg[0].message);
            } else {
                toast.error(msg);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-6">
                {/* Logs */}
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
                            deletingId={deleteMutation.isPending ? deleteTarget?.id : null}
                            onDelete={setDeleteTarget}
                        />
                    </div>

                    <CustomPagination
                        page={page}
                        pageSize={pageSize}
                        total={logsData?.data?.data?.total || 0}
                        onChange={setPage}
                    />
                </div>
            </div>

            <PointLogDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !deleteMutation.isPending) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除这条积分记录？</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget ? `${deleteTarget.name} - ${deleteTarget.pointName}（${deleteTarget.point}）` : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>取消</AlertDialogCancel>
                        <AlertDialogAction disabled={deleteMutation.isPending} onClick={handleConfirmDelete}>
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
