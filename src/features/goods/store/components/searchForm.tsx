"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchFormData {
    materialName?: string;
    materialCode?: string;
    type?: string;
    supplier?: string;
}

interface SearchFormProps {
    onSearch: (data: SearchFormData) => void;
    onReset?: () => void;
}

export default function SearchForm({ onSearch, onReset }: SearchFormProps) {
    const { register, handleSubmit, reset } = useForm<SearchFormData>();

    const onSubmit = (data: SearchFormData) => {
        const formData: SearchFormData = { ...data };

        // Filter empty strings
        if (!formData.materialName) delete formData.materialName;
        if (!formData.materialCode) delete formData.materialCode;
        if (!formData.type) delete formData.type;
        if (!formData.supplier) delete formData.supplier;

        onSearch(formData);
    };

    const handleReset = () => {
        reset();
        onReset?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-nowrap gap-4 items-end overflow-x-auto pb-2">
                {/* Material Name */}
                <div className="flex items-center gap-2 shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap">物料名称</label>
                    <div className="w-[140px]">
                        <Input
                            placeholder="请输入物料名称"
                            {...register("materialName")}
                        />
                    </div>
                </div>

                {/* Material Code */}
                <div className="flex items-center gap-2 shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap">物料编码</label>
                    <div className="w-[140px]">
                        <Input
                            placeholder="请输入物料编码"
                            {...register("materialCode")}
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2 shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap">类别</label>
                    <div className="w-[100px]">
                        <Input
                            placeholder="请输入类别"
                            {...register("type")}
                        />
                    </div>
                </div>

                {/* Supplier */}
                <div className="flex items-center gap-2 shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap">供应商</label>
                    <div className="w-[120px]">
                        <Input
                            placeholder="请输入供应商"
                            {...register("supplier")}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 shrink-0">
                    <Button type="submit">查询</Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                        重置
                    </Button>
                </div>
            </div>
        </form>
    );
}
