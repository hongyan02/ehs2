"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

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
}

export default function PointLogTable({ data, isLoading }: PointLogTableProps) {
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
            accessorKey: "description",
            header: "描述",
        },
        {
            accessorKey: "createdAt",
            header: "时间",
        },
    ];

    return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
