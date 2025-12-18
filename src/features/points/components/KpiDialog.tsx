"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AutoComplete as AutoCompleteSelect } from "@/components/autoCompleteSelect";
import { usePointPersonList } from "../query";
import { toast } from "sonner";

const kpiSchema = z.object({
    username: z.string().min(1, "请选择人员"),
    nickname: z.string().optional(),
    year: z.string().min(4, "请输入年份"),
    jan: z.string().optional(),
    feb: z.string().optional(),
    mar: z.string().optional(),
    apr: z.string().optional(),
    may: z.string().optional(),
    jun: z.string().optional(),
    jul: z.string().optional(),
    aug: z.string().optional(),
    sep: z.string().optional(),
    oct: z.string().optional(),
    nov: z.string().optional(),
    dec: z.string().optional(),
});

export type KpiFormValues = z.infer<typeof kpiSchema>;

interface KpiDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSubmit: (values: KpiFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export default function KpiDialog({ open, onOpenChange, initialData, onSubmit, isSubmitting }: KpiDialogProps) {
    const { control, handleSubmit, reset, setValue } = useForm<KpiFormValues>({
        resolver: zodResolver(kpiSchema),
        defaultValues: {
            username: "",
            nickname: "",
            year: new Date().getFullYear().toString(),
        },
    });

    // Reset form when dialog opens or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    username: initialData.username,
                    nickname: initialData.nickname || "",
                    year: initialData.year,
                    jan: initialData.jan || "",
                    feb: initialData.feb || "",
                    mar: initialData.mar || "",
                    apr: initialData.apr || "",
                    may: initialData.may || "",
                    jun: initialData.jun || "",
                    jul: initialData.jul || "",
                    aug: initialData.aug || "",
                    sep: initialData.sep || "",
                    oct: initialData.oct || "",
                    nov: initialData.nov || "",
                    dec: initialData.dec || "",
                });
            } else {
                reset({
                    username: "",
                    nickname: "",
                    year: new Date().getFullYear().toString(),
                });
            }
        }
    }, [open, initialData, reset]);

    // Fetch all duty persons for selection
    const { data: personData } = usePointPersonList({ pageSize: 1000, active: 1 });
    const personOptions = personData?.data?.data?.list?.map((p: any) => ({
        label: `${p.name} (${p.no})`,
        value: p.name,
        original: p,
    })) || [];

    const onPersonSelect = (value: string, option: any) => {
        setValue("username", value);
        if (option?.original?.no) {
            setValue("nickname", option.original.no);
        }
    };

    const months = [
        { key: "jan", label: "1月" }, { key: "feb", label: "2月" }, { key: "mar", label: "3月" },
        { key: "apr", label: "4月" }, { key: "may", label: "5月" }, { key: "jun", label: "6月" },
        { key: "jul", label: "7月" }, { key: "aug", label: "8月" }, { key: "sep", label: "9月" },
        { key: "oct", label: "10月" }, { key: "nov", label: "11月" }, { key: "dec", label: "12月" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "编辑 KPI" : "添加人员 KPI"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">人员</label>
                            <Controller
                                control={control}
                                name="username"
                                render={({ field }) => (
                                    initialData ? (
                                        <Input value={field.value} disabled />
                                    ) : (
                                        <AutoCompleteSelect
                                            value={personOptions.find((opt: any) => opt.value === field.value)}
                                            onValueChange={(option) => {
                                                const val = option?.value || "";
                                                onPersonSelect(val, option);
                                            }}
                                            options={personOptions}
                                            placeholder="选择人员"
                                            emptyMessage="未找到人员"
                                        />
                                    )
                                )}
                            />
                        </div>

                        <div className="w-32 space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">年份</label>
                            <Controller
                                control={control}
                                name="year"
                                render={({ field }) => (
                                    <Input {...field} disabled={!!initialData} />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {months.map((m) => (
                            <div key={m.key} className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{m.label}</label>
                                <Controller
                                    control={control}
                                    name={m.key as any}
                                    render={({ field }) => (
                                        <Input {...field} type="number" step="0.1" />
                                    )}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            保存
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
