"use client";

import { useEffect, useState } from "react";
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
import { AutoComplete, Option } from "@/components/autoCompleteSelect";
import { usePointEventList, usePointPersonList } from "../query";

interface PointLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PointLogFormValues) => void;
    isSubmitting: boolean;
}

export interface PointLogFormValues {
    pointName: string;
    description: string;
    eventId: number;
    defaultPoint: number;
    point: number;
    no: string;
}

export default function PointLogDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: PointLogDialogProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PointLogFormValues>({
        defaultValues: {
            pointName: "",
            description: "",
            eventId: 0,
            defaultPoint: 0,
            point: 0,
            no: "",
        },
    });

    const { data: persons, isLoading: isPersonsLoading } = usePointPersonList({ pageSize: 1000, active: 1 });
    const { data: events, isLoading: isEventsLoading } = usePointEventList({ pageSize: 1000 });

    const [selectedPerson, setSelectedPerson] = useState<Option | undefined>(undefined);
    const [selectedEvent, setSelectedEvent] = useState<Option | undefined>(undefined);

    const personOptions = persons?.data?.data?.list?.map((p: any) => ({
        value: p.no,
        label: `${p.name} (${p.no}) - ${p.dept || '无部门'}`,
        no: p.no,
    })) || [];

    const eventOptions = events?.data?.data?.list?.map((e: any) => ({
        value: String(e.id),
        label: `${e.name} (默认: ${e.defaultPoint})`,
        name: e.name,
        defaultPoint: String(e.defaultPoint),
    })) || [];

    useEffect(() => {
        if (!open) {
            reset();
            setSelectedPerson(undefined);
            setSelectedEvent(undefined);
        }
    }, [open, reset]);

    const handleClose = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
    };

    const handlePersonChange = (opt: Option) => {
        setSelectedPerson(opt);
        setValue("no", opt.no);
    };

    const handleEventChange = (opt: Option) => {
        setSelectedEvent(opt);
        setValue("eventId", parseInt(opt.value));
        setValue("pointName", opt.name);
        setValue("defaultPoint", parseInt(opt.defaultPoint));
        setValue("point", parseInt(opt.defaultPoint));
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>记录积分</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label className="mb-2 block">选择人员</Label>
                        <AutoComplete
                            options={personOptions}
                            emptyMessage="无匹配人员"
                            placeholder="搜索姓名或工号"
                            isLoading={isPersonsLoading}
                            value={selectedPerson}
                            onValueChange={handlePersonChange}
                        />
                        <input type="hidden" {...register("no", { required: "请选择人员" })} />
                        {errors.no && <p className="text-red-500 text-sm">{errors.no.message}</p>}
                    </div>

                    <div>
                        <Label className="mb-2 block">选择事件</Label>
                        <AutoComplete
                            options={eventOptions}
                            emptyMessage="无匹配事件"
                            placeholder="搜索积分事件"
                            isLoading={isEventsLoading}
                            value={selectedEvent}
                            onValueChange={handleEventChange}
                        />
                        <input type="hidden" {...register("eventId", { required: "请选择事件", valueAsNumber: true })} />
                        {errors.eventId && <p className="text-red-500 text-sm">{errors.eventId.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="pointName" className="mb-2 block">积分名称</Label>
                        <Input id="pointName" {...register("pointName", { required: "名称不能为空" })} />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="defaultPoint" className="mb-2 block">默认积分</Label>
                            <Input id="defaultPoint" disabled {...register("defaultPoint")} />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="point" className="mb-2 block">实际积分</Label>
                            <Input id="point" type="number" {...register("point", { valueAsNumber: true, required: "请输入积分" })} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description" className="mb-2 block">描述/备注</Label>
                        <Input id="description" {...register("description")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
