"use client";

import { useKpiRecords, usePointRanking } from "../query";
import RankingTable from "./RankingTable";

interface TotalRankingProps {
    month?: string;
}

export default function TotalRanking({ month }: TotalRankingProps) {
    // If month is not provided, default to current month? Or handle empty.
    // Assuming month is always passed from RankingView
    const safeMonth = month || new Date().toISOString().substring(0, 7);

    // Use usePointRanking instead of usePointTotalRanking to get monthly points
    const { data, isLoading } = usePointRanking(safeMonth);
    const currentYear = safeMonth.split("-")[0];
    const { data: kpiData } = useKpiRecords(currentYear);

    return (
        <div className="space-y-4">
            <RankingTable
                data={data?.data?.data || []}
                isLoading={isLoading}
                kpiList={kpiData?.data?.data || []}
                showKpi={true}
                currentMonth={safeMonth}
            />
        </div>
    );
}
