import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { WebhookConfig } from "../query/api";
import { Edit } from "lucide-react";

interface ConfigTableProps {
    data: WebhookConfig[];
    onEdit: (config: WebhookConfig) => void;
}

const columnHelper = createColumnHelper<WebhookConfig>();

export const ConfigTable = ({ data, onEdit }: ConfigTableProps) => {
    const columns = [
        columnHelper.accessor("id", {
            header: "ID",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("scene", {
            header: "场景",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("webhookKey", {
            header: "Webhook Key",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("description", {
            header: "描述",
            cell: (info) => info.getValue() || "-",
        }),
        columnHelper.accessor("updatedAt", {
            header: "更新时间",
            cell: (info) => info.getValue(),
        }),
        columnHelper.display({
            id: "actions",
            header: "操作",
            cell: (info) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(info.row.original)}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                暂无数据
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
