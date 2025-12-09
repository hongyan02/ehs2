"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

export interface PointPerson {
    id: number;
    no: string;
    name: string;
    dept: string | null;
    active: number;
    createdAt: string;
    updatedAt: string;
}

interface PersonTableProps {
    data: PointPerson[];
    isLoading: boolean;
    onEdit: (person: PointPerson) => void;
    onDelete: (id: number) => void;
}

export default function PersonTable({ data, isLoading, onEdit, onDelete }: PersonTableProps) {
    const columns: ColumnDef<PointPerson>[] = [
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
            accessorKey: "active",
            header: "状态",
            cell: ({ row }) => {
                const isActive = row.original.active === 1;
                return (
                    <Badge variant={isActive ? "default" : "destructive"}>
                        {isActive ? "启用" : "禁用"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "创建时间",
        },
        {
            id: "actions",
            header: "操作",
            cell: ({ row }) => {
                const person = row.original;
                return (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(person)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => onDelete(person.id)}
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
