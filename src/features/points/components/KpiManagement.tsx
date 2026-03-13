import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateKpi, useKpiList, useKpiRecords, useSyncKpi, useUpdateKpi } from "../query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react"; // Pencil for edit
import KpiDialog from "./KpiDialog";

interface KpiRecord {
    id: number;
    username: string;
    nickname: string | null;
    year: string;
    jan: string | null;
    feb: string | null;
    mar: string | null;
    apr: string | null;
    may: string | null;
    jun: string | null;
    jul: string | null;
    aug: string | null;
    sep: string | null;
    oct: string | null;
    nov: string | null;
    dec: string | null;
}

export default function KpiManagement() {
    const currentMonth = (new Date().getMonth() + 1).toString();
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState(currentMonth);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<KpiRecord | null>(null);

    // Internal DB Records
    const { data: records, isLoading, refetch } = useKpiRecords(year);

    // Mutations
    const createMutation = useCreateKpi();
    const updateMutation = useUpdateKpi();
    const syncMutation = useSyncKpi();

    // External API Query (for sync)
    // We only fetch this when user clicks Sync
    const [isSyncing, setIsSyncing] = useState(false);
    const { refetch: fetchExternalKpi } = useKpiList({ nf: year, mon: month });

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { data: externalResponse } = await fetchExternalKpi();
            if (!externalResponse || !externalResponse.data || !externalResponse.data.data) {
                toast.error("从外部接口获取数据失败");
                return;
            }
            const externalData = externalResponse.data.data;
            await syncMutation.mutateAsync(externalData);
            toast.success(`成功同步 ${externalData.length} 条记录`);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("同步失败");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAdd = () => {
        setEditingRecord(null);
        setDialogOpen(true);
    };

    const handleEdit = (record: KpiRecord) => {
        setEditingRecord(record);
        setDialogOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingRecord) {
                await updateMutation.mutateAsync({ id: editingRecord.id, data: values });
                toast.success("更新成功");
            } else {
                await createMutation.mutateAsync(values);
                toast.success("创建成功");
            }
            setDialogOpen(false);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("保存失败");
        }
    };

    const columns: ColumnDef<KpiRecord>[] = [
        { accessorKey: "username", header: "姓名" },
        { accessorKey: "nickname", header: "工号" },
        { accessorKey: "jan", header: "1月" },
        { accessorKey: "feb", header: "2月" },
        { accessorKey: "mar", header: "3月" },
        { accessorKey: "apr", header: "4月" },
        { accessorKey: "may", header: "5月" },
        { accessorKey: "jun", header: "6月" },
        { accessorKey: "jul", header: "7月" },
        { accessorKey: "aug", header: "8月" },
        { accessorKey: "sep", header: "9月" },
        { accessorKey: "oct", header: "10月" },
        { accessorKey: "nov", header: "11月" },
        { accessorKey: "dec", header: "12月" },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="w-32"
                    />
                    <span className="text-sm text-gray-500 font-bold">年份</span>
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                                const m = (i + 1).toString();
                                return (
                                    <SelectItem key={m} value={m}>
                                        {m}月
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500 font-bold">KPI</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加人员
                    </Button>
                    <Button onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        同步 KPI
                    </Button>
                </div>
            </div>

            <div className="border rounded-md">
                <DataTable
                    columns={columns}
                    data={records?.data?.data || []}
                    isLoading={isLoading}
                />
            </div>

            <KpiDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialData={editingRecord}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
