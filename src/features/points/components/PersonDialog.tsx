"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { AutoComplete, Option } from "@/components/autoCompleteSelect";
import { PointPerson } from "./PersonTable";
import useUserListStore from "@/stores/useUserList";

interface PersonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    person: PointPerson | null; // null means create
    onSubmit: (values: PersonFormValues) => void;
    isSubmitting: boolean;
}

export interface PersonFormValues {
    no: string;
    name: string;
    dept: string;
    active: string; // Select returns string
}

export default function PersonDialog({
    open,
    onOpenChange,
    person,
    onSubmit,
    isSubmitting,
}: PersonDialogProps) {
    const { userList } = useUserListStore();

    // Memoize options to avoid unnecessary re-renders
    const userNameOptions: Option[] = useMemo(() =>
        userList.map((user) => ({
            label: user.nickName,
            value: user.nickName,
            userName: user.userName,
            dept: user.deptName || "",
        })),
        [userList]);

    // 工号选项列表
    const userNoOptions: Option[] = useMemo(() =>
        userList.map((user) => ({
            label: user.userName,
            value: user.userName,
            nickName: user.nickName,
            dept: user.deptName || "",
        })),
        [userList]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<PersonFormValues>({
        defaultValues: {
            no: "",
            name: "",
            dept: "",
            active: "1",
        },
    });

    useEffect(() => {
        if (open) {
            if (person) {
                reset({
                    no: person.no,
                    name: person.name,
                    dept: person.dept || "",
                    active: String(person.active),
                });
            } else {
                reset({
                    no: "",
                    name: "",
                    dept: "",
                    active: "1",
                });
            }
        }
    }, [open, person, reset]);

    const handleClose = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
    };

    const handleNameChange = (option: Option) => {
        const selectedUser = userList.find((user) => user.nickName === option.value);
        setValue("name", option.value, { shouldDirty: true, shouldValidate: true });

        if (selectedUser) {
            setValue("no", selectedUser.userName, { shouldDirty: true, shouldValidate: true });
            setValue("dept", selectedUser.deptName || "", { shouldDirty: true });
        }
    };

    const handleNoChange = (option: Option) => {
        const selectedUser = userList.find((user) => user.userName === option.value);
        setValue("no", option.value, { shouldDirty: true, shouldValidate: true });

        if (selectedUser) {
            setValue("name", selectedUser.nickName, { shouldDirty: true, shouldValidate: true });
            setValue("dept", selectedUser.deptName || "", { shouldDirty: true });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{person ? "编辑人员" : "新增人员"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="mb-2 block">姓名</Label>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: "请输入姓名" }}
                            render={({ field }) => {
                                const selectedUserOption =
                                    userNameOptions.find((option) => option.value === field.value) ??
                                    (field.value ? { label: field.value, value: field.value } : undefined);

                                return (
                                    <AutoComplete
                                        options={userNameOptions}
                                        placeholder="选择或输入姓名"
                                        emptyMessage="没有匹配的姓名"
                                        value={selectedUserOption}
                                        onValueChange={handleNameChange}
                                        disabled={!!person}
                                    />
                                );
                            }}
                        />
                        {errors.name ? <p className="mt-2 text-sm text-red-500">{errors.name.message}</p> : null}
                    </div>
                    <div>
                        <Label htmlFor="no" className="mb-2 block">工号</Label>
                        <Controller
                            control={control}
                            name="no"
                            rules={{ required: "请输入工号" }}
                            render={({ field }) => {
                                const selectedNoOption =
                                    userNoOptions.find((option) => option.value === field.value) ??
                                    (field.value ? { label: field.value, value: field.value } : undefined);

                                return (
                                    <AutoComplete
                                        options={userNoOptions}
                                        placeholder="选择或输入工号"
                                        emptyMessage="没有匹配的工号"
                                        value={selectedNoOption}
                                        onValueChange={handleNoChange}
                                        disabled={!!person}
                                    />
                                );
                            }}
                        />
                        {errors.no ? <p className="mt-2 text-sm text-red-500">{errors.no.message}</p> : null}
                    </div>
                    <div>
                        <Label htmlFor="dept" className="mb-2 block">部门</Label>
                        <Input id="dept" {...register("dept")} />
                    </div>
                    <div>
                        <Label className="mb-2 block">状态</Label>
                        <Controller
                            control={control}
                            name="active"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">启用</SelectItem>
                                        <SelectItem value="0">禁用</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
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
