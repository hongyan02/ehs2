"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SearchFormData {
    startDate?: string;
    endDate?: string;
    shift?: number;
}

interface SearchFormProps {
    onSearch: (data: SearchFormData) => void;
    onReset?: () => void;
}

export default function SearchForm({ onSearch, onReset }: SearchFormProps) {
    const { handleSubmit, reset } = useForm<SearchFormData>();
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [shift, setShift] = useState<number | undefined>();
    const shiftValue = shift !== undefined ? String(shift) : "all";

    const onSubmit = () => {
        const formData: SearchFormData = {};

        if (startDate) {
            formData.startDate = format(startDate, "yyyy-MM-dd");
        }
        if (endDate) {
            formData.endDate = format(endDate, "yyyy-MM-dd");
        }
        if (shift !== undefined) {
            formData.shift = shift;
        }

        onSearch(formData);
    };

    const handleReset = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setShift(undefined);
        reset();
        onReset?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
                {/* 开始日期 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">开始日期</label>
                    <div className="flex-1 min-w-[180px]">
                        <DatePicker
                            date={startDate}
                            onSelect={setStartDate}
                            placeholder="选择开始日期"
                        />
                    </div>
                </div>

                {/* 结束日期 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">结束日期</label>
                    <div className="flex-1 min-w-[180px]">
                        <DatePicker
                            date={endDate}
                            onSelect={setEndDate}
                            placeholder="选择结束日期"
                        />
                    </div>
                </div>

                {/* 班次选择 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">班次</label>
                    <Select
                        value={shiftValue}
                        onValueChange={(value) =>
                            setShift(value === "all" ? undefined : Number(value))
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="0">白班</SelectItem>
                            <SelectItem value="1">夜班</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 按钮 */}
                <div className="flex gap-2">
                    <Button type="submit">查询</Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                        重置
                    </Button>
                </div>
            </div>
        </form>
    );
}
