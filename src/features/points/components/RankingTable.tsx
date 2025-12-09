"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export interface RankingItem {
    no: string;
    name: string;
    dept: string;
    totalPoints: number;
}

interface RankingTableProps {
    data: RankingItem[];
    isLoading: boolean;
}

export default function RankingTable({ data, isLoading }: RankingTableProps) {
    const columns: ColumnDef<RankingItem>[] = [
        {
            header: "排名",
            cell: ({ row }) => {
                return <div>{row.index + 1}</div>;
            },
        },
        {
            accessorKey: "no",
            header: "工号",
        },
        {
            accessorKey: "name",
            header: "姓名",
        },
        {
            accessorKey: "totalPoints",
            header: "总积分",
            cell: ({ row }) => {
                const points = row.original.totalPoints;
                return <div className="font-bold text-lg">{points}</div>;
            },
        },
    ];

    return <DataTable columns={columns} data={data} isLoading={isLoading} emptyText="暂无排名" />;
}
