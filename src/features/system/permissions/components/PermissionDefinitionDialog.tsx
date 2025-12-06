"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreatePermissionDefinition,
    useUpdatePermissionDefinition,
} from "../query";
import type { PermissionDefinitionData } from "../query/api";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect } from "react";

interface PermissionDefinitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission?: PermissionDefinitionData | null;
    onSuccess?: () => void;
}

interface FormData {
    code: string;
    name: string;
    description?: string;
    routes: { value: string }[];
}

export default function PermissionDefinitionDialog({
    open,
    onOpenChange,
    permission,
    onSuccess,
}: PermissionDefinitionDialogProps) {
    const isEdit = !!permission;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            code: "",
            name: "",
            description: "",
            routes: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "routes",
    });

    const createMutation = useCreatePermissionDefinition();
    const updateMutation = useUpdatePermissionDefinition();

    // 当permission变化时，重置表单
    useEffect(() => {
        if (permission) {
            reset({
                code: permission.code,
                name: permission.name,
                description: permission.description || "",
                routes: permission.routes.map((r) => ({ value: r })),
            });
        } else {
            reset({
                code: "",
                name: "",
                description: "",
                routes: [{ value: "" }],
            });
        }
    }, [permission, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const routes = data.routes
                .map((r) => r.value.trim())
                .filter((r) => r.length > 0);

            if (routes.length === 0) {
                toast.error("至少需要一个路由");
                return;
            }

            const payload = {
                code: data.code,
                name: data.name,
                description: data.description,
                routes,
            };

            if (isEdit && permission!.id) {
                await updateMutation.mutateAsync({
                    id: permission!.id,
                    data: payload,
                });
                toast.success("权限定义更新成功");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("权限定义创建成功");
            }

            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("保存权限定义失败:", error);
            toast.error(isEdit ? "更新权限定义失败" : "创建权限定义失败");
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "编辑权限定义" : "新增权限定义"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">
                                权限代码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="code"
                                {...register("code", { required: "权限代码不能为空" })}
                                placeholder="例如：ADMIN"
                                disabled={isEdit}
                                className="font-mono"
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                权限名称 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register("name", { required: "权限名称不能为空" })}
                                placeholder="例如：系统管理员"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="请输入权限描述"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>
                                可访问路由 <span className="text-red-500">*</span>
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => append({ value: "" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                添加路由
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <Input
                                        {...register(`routes.${index}.value` as const)}
                                        placeholder="例如：/system"
                                        className="flex-1"
                                    />
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => remove(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                            💡 提示：路由路径将用于前端权限控制，请确保路径正确
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isPending}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "更新" : "创建"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
