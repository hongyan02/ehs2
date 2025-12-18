"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface PointLog {
    id: number;
    pointName: string;
    description: string | null;
    eventId: number;
    defaultPoint: number;
    point: number;
    no: string;
    name: string;
    dept: string;
    month: string;
    createdAt: string;
}

interface PointLogTableProps {
    data: PointLog[];
    isLoading: boolean;
    onDelete: (log: PointLog) => void;
    deletingId?: number | null;
}

export default function PointLogTable({ data, isLoading, onDelete, deletingId = null }: PointLogTableProps) {
    const columns: ColumnDef<PointLog>[] = [
        {
            accessorKey: "no",
            header: "工号",
        },
        {
            accessorKey: "name",
            header: "姓名",
        },
        {
            accessorKey: "dept",
            header: "部门",
        },
        {
            accessorKey: "pointName",
            header: "积分项目",
        },
        {
            accessorKey: "point",
            header: "变动积分",
            cell: ({ row }) => {
                const val = row.original.point;
                const color = val > 0 ? "text-green-600" : (val < 0 ? "text-red-600" : "");
                return <span className={`font-bold ${color}`}>{val > 0 ? `+${val}` : val}</span>;
            },
        },
        {
            accessorKey: "createdAt",
            header: "时间",
        },
        {
            id: "actions",
            header: "操作",
            cell: ({ row }) => {
                const log = row.original;
                const isDeleting = deletingId === log.id;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        disabled={isDeleting}
                        onClick={() => onDelete(log)}
                        aria-label="删除"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ];

    return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
