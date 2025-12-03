"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SearchFormData {
    name?: string;
    no?: string;
    shift?: number;
}

interface SearchFormProps {
    onSearch: (data: SearchFormData) => void;
    onReset?: () => void;
}

export default function SearchForm({ onSearch, onReset }: SearchFormProps) {
    const { register, handleSubmit, reset } = useForm<SearchFormData>();
    const [shift, setShift] = useState<number | undefined>();
    const shiftValue = shift !== undefined ? String(shift) : "all";

    const onSubmit = (data: SearchFormData) => {
        const formData: SearchFormData = {
            ...data,
        };

        if (shift !== undefined) {
            formData.shift = shift;
        }

        // 过滤空字符串
        if (!formData.name) delete formData.name;
        if (!formData.no) delete formData.no;

        onSearch(formData);
    };

    const handleReset = () => {
        setShift(undefined);
        reset();
        onReset?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
                {/* 姓名 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">姓名</label>
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            placeholder="请输入姓名"
                            {...register("name")}
                        />
                    </div>
                </div>

                {/* 工号 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">工号</label>
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            placeholder="请输入工号"
                            {...register("no")}
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
