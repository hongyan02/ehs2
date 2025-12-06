"use client";

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PermissionDefinitionData } from "../query/api";
import { useState } from "react";
import PermissionDefinitionDialog from "./PermissionDefinitionDialog";

const column = createColumnHelper<PermissionDefinitionData>();

export const permissionDefinitionColumns = (
    onEdit: (permission: PermissionDefinitionData) => void,
    onDelete: (id: number) => void,
): ColumnDef<PermissionDefinitionData, any>[] => [
        column.accessor("code", {
            header: "权限代码",
            cell: (info) => <span className="font-medium font-mono">{info.getValue()}</span>,
        }),

        column.accessor("name", {
            header: "权限名称",
            cell: (info) => info.getValue(),
        }),

        column.accessor("description", {
            header: "描述",
            cell: (info) => info.getValue() || "-",
        }),

        column.accessor("routes", {
            header: "可访问路由",
            cell: (info) => {
                const routes = info.getValue();
                return (
                    <div className="flex flex-wrap gap-1">
                        {routes.map((route: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {route}
                            </Badge>
                        ))}
                    </div>
                );
            },
        }),

        column.display({
            id: "actions",
            header: "操作",
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400/90 hover:text-blue-800"
                            onClick={() => onEdit(row)}
                        >
                            编辑
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => row.id && onDelete(row.id)}
                        >
                            删除
                        </Button>
                    </div>
                );
            },
        }),
    ];

interface PermissionDefinitionTableProps {
    data: PermissionDefinitionData[];
    onDelete: (id: number) => void;
    onUpdate: () => void;
}

export default function PermissionDefinitionTable({
    data,
    onDelete,
    onUpdate,
}: PermissionDefinitionTableProps) {
    const [editPermission, setEditPermission] =
        useState<PermissionDefinitionData | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEdit = (permission: PermissionDefinitionData) => {
        setEditPermission(permission);
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
        setEditPermission(null);
    };

    const handleEditSuccess = () => {
        handleEditClose();
        onUpdate();
    };

    const columns = permissionDefinitionColumns(handleEdit, onDelete);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="rounded-md border">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="h-12 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    暂无数据
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PermissionDefinitionDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                permission={editPermission}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}
