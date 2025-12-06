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
import type { UserPermissionData } from "../query/api";
import { useState } from "react";
import UserPermissionDialog from "./UserPermissionDialog";

const column = createColumnHelper<UserPermissionData>();

export const userPermissionColumns = (
    onEdit: (userPermission: UserPermissionData) => void,
    onDelete: (id: number) => void,
): ColumnDef<UserPermissionData, any>[] => [
        column.accessor("employeeId", {
            header: "员工ID",
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),

        column.accessor("permissions", {
            header: "权限列表",
            cell: (info) => {
                const permissions = info.getValue();
                return (
                    <div className="flex flex-wrap gap-1">
                        {permissions.map((perm: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                {perm}
                            </Badge>
                        ))}
                    </div>
                );
            },
        }),

        column.accessor("createdAt", {
            header: "创建时间",
            cell: (info) => info.getValue() || "-",
        }),

        column.accessor("updatedAt", {
            header: "更新时间",
            cell: (info) => info.getValue() || "-",
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

interface UserPermissionTableProps {
    data: UserPermissionData[];
    onDelete: (id: number) => void;
    onUpdate: () => void;
}

export default function UserPermissionTable({
    data,
    onDelete,
    onUpdate,
}: UserPermissionTableProps) {
    const [editUserPermission, setEditUserPermission] =
        useState<UserPermissionData | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEdit = (userPermission: UserPermissionData) => {
        setEditUserPermission(userPermission);
        setIsEditOpen(true);
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
        setEditUserPermission(null);
    };

    const handleEditSuccess = () => {
        handleEditClose();
        onUpdate();
    };

    const columns = userPermissionColumns(handleEdit, onDelete);

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
            <UserPermissionDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                userPermission={editUserPermission}
                onSuccess={handleEditSuccess}
            />
        </>
    );
}
