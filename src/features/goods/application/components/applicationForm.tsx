"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ApplicationPayload } from "../query";
import useInfoStore from "@/stores/useUserInfo";

interface ApplicationFormProps {
    onSubmit: (data: ApplicationPayload) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    defaultValues?: Partial<ApplicationPayload>;
}

export default function ApplicationForm({
    onSubmit,
    onCancel,
    isLoading,
    defaultValues,
}: ApplicationFormProps) {
    const { nickname, username } = useInfoStore();

    const { register, handleSubmit, setValue, watch, formState: { errors } } =
        useForm<ApplicationPayload>({
            defaultValues: {
                operation: "OUT",
                applicant: nickname,
                applicantNo: username,
                ...defaultValues,
            },
        });

    const operation = watch("operation");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 标题 */}
            <div className="space-y-2">
                <Label htmlFor="title">
                    标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="请输入标题"
                    {...register("title", { required: "标题不能为空" })}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
            </div>

            {/* 操作类型 */}
            <div className="space-y-2">
                <Label htmlFor="operation">
                    操作类型 <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={operation}
                    onValueChange={(value) => setValue("operation", value as "IN" | "OUT")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="请选择操作类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="IN">入库</SelectItem>
                        <SelectItem value="OUT">出库</SelectItem>
                    </SelectContent>
                </Select>
                {errors.operation && (
                    <p className="text-sm text-red-500">{errors.operation.message}</p>
                )}
            </div>

            {/* 申请人姓名 */}
            <div className="space-y-2">
                <Label htmlFor="applicant">
                    申请人姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="applicant"
                    placeholder="请输入申请人姓名"
                    {...register("applicant", { required: "申请人姓名不能为空" })}
                    disabled
                    readOnly
                />
                {errors.applicant && (
                    <p className="text-sm text-red-500">{errors.applicant.message}</p>
                )}
            </div>

            {/* 申请人工号 */}
            <div className="space-y-2">
                <Label htmlFor="applicantNo">
                    申请人工号 <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="applicantNo"
                    placeholder="请输入申请人工号"
                    {...register("applicantNo", { required: "申请人工号不能为空" })}
                    disabled
                    readOnly
                />
                {errors.applicantNo && (
                    <p className="text-sm text-red-500">{errors.applicantNo.message}</p>
                )}
            </div>

            {/* 来源 */}
            <div className="space-y-2">
                <Label htmlFor="origin">来源（部门/项目）</Label>
                <Input
                    id="origin"
                    placeholder="请输入来源"
                    {...register("origin")}
                />
            </div>

            {/* 用途说明 */}
            <div className="space-y-2">
                <Label htmlFor="purpose">用途说明</Label>
                <Textarea
                    id="purpose"
                    placeholder="请输入用途说明"
                    rows={4}
                    {...register("purpose")}
                />
            </div>

            {/* 按钮 */}
            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        取消
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "提交中..." : "提交"}
                </Button>
            </div>
        </form>
    );
}
