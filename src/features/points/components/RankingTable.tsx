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
    kpiList?: any[];
    currentMonth?: string;
    showKpi?: boolean;
}

export default function RankingTable({ data, isLoading, kpiList = [], currentMonth, showKpi = false }: RankingTableProps) {

    // Process and sort data
    const processedData = data.map((item) => {
        let kpiValue = 0;
        const kpiItem = kpiList.find((k: any) => k.username === item.name);

        if (kpiItem) {
            if (currentMonth) {
                const monthStr = currentMonth.split("-")[1];
                const monthMap: Record<string, string> = {
                    "01": "jan", "02": "feb", "03": "mar", "04": "apr",
                    "05": "may", "06": "jun", "07": "jul", "08": "aug",
                    "09": "sep", "10": "oct", "11": "nov", "12": "dec"
                };
                const field = monthMap[monthStr];
                if (field) {
                    kpiValue = parseFloat(kpiItem[field]) || 0;
                }
            } else {
                const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                kpiValue = months.reduce((acc, month) => acc + (parseFloat(kpiItem[month]) || 0), 0);
            }
        }

        const finalTotal = item.totalPoints + kpiValue;
        return {
            ...item,
            kpiValue,
            finalTotal
        };
    }).sort((a, b) => b.finalTotal - a.finalTotal);


    const columns: ColumnDef<RankingItem & { kpiValue: number, finalTotal: number }>[] = [
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
        ...(showKpi ? [{
            id: "kpi",
            header: "KPI",
            cell: ({ row }: any) => {
                const kpiValue = row.original.kpiValue;
                const displayKpi = kpiValue.toFixed(1).replace(/\.0$/, "");
                return <div>{displayKpi}</div>;
            }
        }] : []),
        {
            accessorKey: "totalPoints",
            header: showKpi ? "积分" : "当月积分",
            cell: ({ row }) => {
                const points = row.original.totalPoints;
                return <div>{points}</div>;
            }
        },
        ...(showKpi ? [{
            id: "finalTotal",
            header: "总积分",
            cell: ({ row }: any) => {
                const total = row.original.finalTotal.toFixed(1);
                const displayTotal = total.endsWith(".0") ? total.slice(0, -2) : total;
                return <div className="font-bold text-lg">{displayTotal}</div>;
            },
        }] : []),
    ];

    return <DataTable columns={columns} data={processedData} isLoading={isLoading} emptyText="暂无排名" />;
}
