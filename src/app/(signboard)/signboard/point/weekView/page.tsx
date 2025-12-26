"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useKpiRecords, usePointRanking, usePointLogList } from "@/features/points/query";
import { cn } from "@/utils";
import { Trophy, Calendar } from "lucide-react";

export default function PointSignboardPage() {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentYear = currentMonth.split("-")[0];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Data
    const { data: rankingData } = usePointRanking(currentMonth);
    const { data: kpiData } = useKpiRecords(currentYear);
    const { data: logData } = usePointLogList({ month: currentMonth });

    // Process Data
    const rankingList = useMemo(() => {
        if (!rankingData?.data?.data || !kpiData?.data?.data) return [];

        const rawList = rankingData.data.data;
        const kpiList = kpiData.data.data;

        return rawList.map((item: any) => {
            let kpiValue = 0;
            const kpiItem = kpiList.find((k: any) => k.username === item.name);

            if (kpiItem) {
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
            }

            const finalTotal = item.totalPoints + kpiValue;

            // Find logs for this user
            const userLogs = logData?.data?.data?.list?.filter((log: any) => log.no === item.no) || [];
            // Summarize point items (e.g., top 3 biggest point gains)
            const pointItems = userLogs
                .sort((a: any, b: any) => Math.abs(b.point) - Math.abs(a.point))
                .slice(0, 3)
                .map((log: any) => `${log.pointName} (${log.point > 0 ? '+' : ''}${log.point})`);

            return {
                ...item,
                kpiValue,
                finalTotal,
                pointItems
            };
        }).sort((a: any, b: any) => b.finalTotal - a.finalTotal);
    }, [rankingData, kpiData, logData, currentMonth]);

    const top3 = rankingList.slice(0, 3);
    const rest = rankingList.slice(3);

    return (
        <div className="h-screen w-full bg-slate-50 text-slate-900 font-sans px-4 pt-4 pb-2 overflow-hidden flex flex-col relative transition-opacity duration-700 ease-in-out" style={{ opacity: mounted ? 1 : 0 }}>
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-teal-600 to-slate-50 opacity-10 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center mb-1 shrink-0 h-10">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        积分排行榜
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="bg-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                        </span>
                        <span>安全环境部 EHS</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg px-3 py-1 flex items-center gap-2 border border-slate-100">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-mono font-semibold text-slate-700">
                            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 flex flex-col gap-2 overflow-hidden pt-10">
                {/* Top 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-1 shrink-0">
                    {/* 2nd Place */}
                    {top3[1] && <TopCard rank={2} item={top3[1]} />}
                    {/* 1st Place */}
                    {top3[0] && <TopCard rank={1} item={top3[0]} isCenter />}
                    {/* 3rd Place */}
                    {top3[2] && <TopCard rank={3} item={top3[2]} />}
                </div>

                {/* List View */}
                <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 flex-1 overflow-hidden flex flex-col min-h-0">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-slate-100 font-semibold text-slate-500 text-xs uppercase tracking-wider shrink-0 bg-white/50">
                        <div className="col-span-1 text-center">排名</div>
                        <div className="col-span-2">姓名 / 工号</div>
                        <div className="col-span-1 text-right">当月积分</div>
                        <div className="col-span-1 text-right">KPI</div>
                        <div className="col-span-1 text-right">总积分</div>
                        <div className="col-span-6">积分项 (Top 3)</div>
                    </div>

                    <div className="overflow-y-auto flex-1 px-2 pb-2 custom-scrollbar">
                        {rest.map((item: any, index: number) => (
                            <ListItem key={item.no} item={item} rank={index + 4} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 shrink-0 py-1 text-center text-[10px] text-slate-400 border-t border-slate-100/50 mt-1">
                统计周期：{new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('zh-CN')} ~ {new Date().toLocaleDateString('zh-CN')}
            </footer>
        </div>
    );
}

function TopCard({ rank, item, isCenter = false }: { rank: number; item: any; isCenter?: boolean }) {
    const bgColor = rank === 1 ? "bg-yellow-50/50 border-yellow-200" : rank === 2 ? "bg-slate-50/50 border-slate-200" : "bg-orange-50/50 border-orange-200";

    return (
        <div
            className={cn(
                "relative rounded-2xl p-3 border shadow-md backdrop-blur-md flex flex-col items-center text-center transition-transform duration-500 hover:-translate-y-1 hover:shadow-lg",
                bgColor,
                isCenter ? "h-60 justify-center z-10 scale-102 border-2 shadow-lg" : "h-52 justify-end"
            )}
        >
            <div className={cn("absolute -top-3 w-8 h-8 flex items-center justify-center rounded-full shadow-sm bg-white border-2",
                rank === 1 ? "border-yellow-400 text-yellow-600" : rank === 2 ? "border-gray-300 text-gray-500" : "border-amber-300 text-amber-600"
            )}>
                <span className="font-bold text-base">#{rank}</span>
            </div>

            <h3 className={cn("font-bold text-slate-800 mt-4", isCenter ? "text-lg" : "text-base")}>{item.name}</h3>
            <p className="text-slate-500 text-[10px] mb-1">{item.dept}</p>

            <div className="grid grid-cols-2 gap-1.5 w-full mt-auto">
                <div className="bg-white/60 rounded-lg p-1">
                    <div className="text-[10px] text-slate-500 transform scale-90">当月</div>
                    <div className="font-bold text-blue-600 text-sm">{item.totalPoints}</div>
                </div>
                <div className="bg-white/60 rounded-lg p-1">
                    <div className="text-[10px] text-slate-500 transform scale-90">KPI</div>
                    <div className="font-bold text-green-600 text-sm">{item.kpiValue.toFixed(1).replace(/\.0$/, "")}</div>
                </div>
            </div>
            <div className="mt-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-1 rounded-lg shadow-sm">
                <div className="text-[10px] opacity-90 transform scale-90">总积分</div>
                <div className="text-xl font-black leading-none">{item.finalTotal.toFixed(1).replace(/\.0$/, "")}</div>
            </div>
        </div>
    );
}

function ListItem({ item, rank }: { item: any; rank: number }) {
    return (
        <div
            className="grid grid-cols-12 gap-2 px-2 py-1.5 border-b border-slate-100 last:border-0 items-center hover:bg-white/60 transition-colors"
        >
            <div className="col-span-1 text-center font-bold text-slate-400 text-xs text-slate-500">#{rank}</div>
            <div className="col-span-2 flex items-center gap-2">
                <div>
                    <span className="font-bold text-slate-700 text-sm mr-2">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.no}</span>
                </div>
            </div>
            <div className="col-span-1 text-right font-mono font-medium text-blue-600 text-sm">{item.totalPoints}</div>
            <div className="col-span-1 text-right font-mono font-medium text-green-600 text-sm">{item.kpiValue.toFixed(1).replace(/\.0$/, "")}</div>
            <div className="col-span-1 text-right">
                <span className="font-bold text-base text-slate-800">{item.finalTotal.toFixed(1).replace(/\.0$/, "")}</span>
            </div>
            <div className="col-span-6 text-[10px] text-slate-500 flex flex-nowrap overflow-hidden gap-1 items-center h-full">
                {item.pointItems?.map((pi: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 px-1.5 rounded-sm border border-slate-200 text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                        {pi}
                    </span>
                ))}
            </div>
        </div>
    )
}
