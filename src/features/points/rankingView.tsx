"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import RankingTable from "./components/RankingTable";
import TotalRankingView from "./components/TotalRanking";
import { useKpiRecords, usePointRanking } from "./query";
import dayjs from "dayjs";

export default function RankingView() {
    const [searchMonth, setSearchMonth] = useState(dayjs().format("YYYY-MM"));

    // Ranking Query - depends on Month
    const { data: rankingData, isLoading: rankingLoading } = usePointRanking(searchMonth);

    // Kpi Query (from local DB)
    const { data: kpiData } = useKpiRecords(searchMonth.split("-")[0]);

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">选择月份:</span>
                <Input
                    type="month"
                    value={searchMonth}
                    onChange={(e) => setSearchMonth(e.target.value)}
                    className="w-40"
                />
            </div>

            <Tabs defaultValue="monthly" className="w-full">
                <TabsList>
                    <TabsTrigger value="monthly">月度排行</TabsTrigger>
                    <TabsTrigger value="total">总积分排行</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="mt-4 space-y-2">
                    <div className="border rounded-md bg-white">
                        <RankingTable
                            data={rankingData?.data?.data || []}
                            isLoading={rankingLoading}
                            kpiList={kpiData?.data?.data || []}
                            currentMonth={searchMonth}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="total" className="mt-4 space-y-2">
                    <TotalRankingView month={searchMonth} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
