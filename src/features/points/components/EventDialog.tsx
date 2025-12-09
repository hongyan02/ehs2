"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePointCategoriesList } from "../query";
import { PointEvent } from "./EventTable";

interface EventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: PointEvent | null;
    onSubmit: (values: EventFormValues) => void;
    isSubmitting: boolean;
}

export interface EventFormValues {
    name: string;
    description: string;
    categoryId: string; // Select value
    defaultPoint: number;
}

export default function EventDialog({
    open,
    onOpenChange,
    event,
    onSubmit,
    isSubmitting,
}: EventDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormValues>({
        defaultValues: {
            name: "",
            description: "",
            categoryId: "",
            defaultPoint: 0,
        },
    });

    const { data: categories } = usePointCategoriesList();

    useEffect(() => {
        if (open) {
            if (event) {
                reset({
                    name: event.name,
                    description: event.description || "",
                    categoryId: String(event.categoryId),
                    defaultPoint: event.defaultPoint,
                });
            } else {
                reset({
                    name: "",
                    description: "",
                    categoryId: "",
                    defaultPoint: 0,
                });
            }
        }
    }, [open, event, reset]);

    const handleClose = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
    };

    const categoryIdValue = watch("categoryId");

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{event ? "编辑事件" : "新增事件"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="mb-2 block">事件名称</Label>
                        <Input id="name" {...register("name", { required: "名称不能为空" })} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="category" className="mb-2 block">分类</Label>
                        <Select
                            value={categoryIdValue}
                            onValueChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择分类" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.data?.data?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.categoryName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Manual validation display if needed, but required checking is done on submit usage usually */}
                    </div>
                    <div>
                        <Label htmlFor="defaultPoint" className="mb-2 block">默认积分</Label>
                        <Input
                            id="defaultPoint"
                            type="number"
                            {...register("defaultPoint", { valueAsNumber: true, required: "请输入积分" })}
                        />
                        {errors.defaultPoint && <p className="text-red-500 text-sm">{errors.defaultPoint.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description" className="mb-2 block">描述</Label>
                        <Input id="description" {...register("description")} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "保存中..." : "保存"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
