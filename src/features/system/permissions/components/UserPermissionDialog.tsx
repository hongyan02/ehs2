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
import {
    useCreateUserPermission,
    useUpdateUserPermission,
    usePermissionDefinitions,
} from "../query";
import type { UserPermissionData } from "../query/api";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserPermissionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userPermission?: UserPermissionData | null;
    onSuccess?: () => void;
}

interface FormData {
    employeeId: string;
    permissions: { value: string }[];
}

export default function UserPermissionDialog({
    open,
    onOpenChange,
    userPermission,
    onSuccess,
}: UserPermissionDialogProps) {
    const isEdit = !!userPermission;

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            employeeId: "",
            permissions: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "permissions",
    });

    const createMutation = useCreateUserPermission();
    const updateMutation = useUpdateUserPermission();

    // 获取所有权限定义
    const { data: permissionDefsData } = usePermissionDefinitions({
        page: 1,
        pageSize: 100,
    });

    const availablePermissions = (permissionDefsData?.data?.data as any[]) || [];



    // 当userPermission变化时，重置表单
    useEffect(() => {
        if (userPermission) {
            reset({
                employeeId: userPermission.employeeId,
                permissions: userPermission.permissions.map((p) => ({ value: p })),
            });
        } else {
            reset({
                employeeId: "",
                permissions: [{ value: "" }],
            });
        }
    }, [userPermission, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const permissions = data.permissions
                .map((p) => p.value.trim())
                .filter((p) => p.length > 0);

            if (permissions.length === 0) {
                toast.error("至少需要一个权限");
                return;
            }

            const payload = {
                employeeId: data.employeeId,
                permissions,
            };

            if (isEdit && userPermission!.id) {
                await updateMutation.mutateAsync({
                    id: userPermission!.id,
                    data: payload,
                });
                toast.success("用户权限更新成功");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("用户权限创建成功");
            }

            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("保存用户权限失败:", error);
            toast.error(isEdit ? "更新用户权限失败" : "创建用户权限失败");
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
                    <DialogTitle>{isEdit ? "编辑用户权限" : "新增用户权限"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">
                            员工ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="employeeId"
                            {...register("employeeId", { required: "员工ID不能为空" })}
                            placeholder="请输入员工ID/工号"
                            disabled={isEdit}
                        />
                        {errors.employeeId && (
                            <p className="text-sm text-red-500">
                                {errors.employeeId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>
                                权限列表 <span className="text-red-500">*</span>
                            </Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => append({ value: "" })}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                添加权限
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <Select
                                        value={watch(`permissions.${index}.value`)}
                                        onValueChange={(value) =>
                                            setValue(`permissions.${index}.value`, value)
                                        }
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="选择权限" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePermissions.map((perm: any) => (
                                                <SelectItem key={perm.code} value={perm.code}>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono">
                                                            {perm.code}
                                                        </Badge>
                                                        <span>{perm.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                            💡 提示：为用户分配权限后，将根据权限定义中的路由控制访问
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
