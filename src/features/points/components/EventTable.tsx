"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export interface PointEvent {
    id: number;
    name: string;
    description: string | null;
    categoryId: number;
    categoryName: string | null;
    defaultPoint: number;
    createdAt: string;
    updatedAt: string;
}

interface EventTableProps {
    data: PointEvent[];
    isLoading: boolean;
    onEdit: (event: PointEvent) => void;
    onDelete: (id: number) => void;
}

export default function EventTable({ data, isLoading, onEdit, onDelete }: EventTableProps) {
    const columns: ColumnDef<PointEvent>[] = [
        {
            accessorKey: "name",
            header: "事件名称",
        },
        {
            accessorKey: "categoryName",
            header: "分类",
        },
        {
            accessorKey: "defaultPoint",
            header: "默认积分",
        },
        {
            accessorKey: "description",
            header: "描述",
        },
        {
            accessorKey: "createdAt",
            header: "创建时间",
        },
        {
            id: "actions",
            header: "操作",
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => onDelete(event.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
