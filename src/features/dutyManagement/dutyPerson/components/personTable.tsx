"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { DutyPersonData } from "../query";

const column = createColumnHelper<DutyPersonData>();

export const dutyPersonColumns = (
  onEdit: (person: DutyPersonData) => void,
  onDelete: (id: number) => void,
): ColumnDef<DutyPersonData, any>[] => [
    column.accessor("no", {
      header: "工号",
      cell: (info) => info.getValue(),
    }),

    column.accessor("name", {
      header: "姓名",
      cell: (info) => info.getValue(),
    }),

    column.accessor("position", {
      header: "职位",
      cell: (info) => info.getValue() ?? "-",
    }),

    column.accessor("shift", {
      header: "班次",
      cell: (info) => (info.getValue() === 0 ? "白班" : "夜班"),
    }),

    column.accessor("phone", {
      header: "手机号",
      cell: (info) => info.getValue(),
    }),

    column.display({
      id: "actions",
      header: "操作",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-800"
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

interface PersonTableProps {
  data: DutyPersonData[];
  onEdit: (person: DutyPersonData) => void;
  onDelete: (id: number) => void;
}

export default function PersonTable({
  data,
  onEdit,
  onDelete,
}: PersonTableProps) {
  const table = useReactTable({
    data,
    columns: dutyPersonColumns(onEdit, onDelete),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
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
              <tr key={row.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={dutyPersonColumns(onEdit, onDelete).length} className="h-24 text-center">
                暂无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
