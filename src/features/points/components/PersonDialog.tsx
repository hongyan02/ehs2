"use client";

import { useEffect, useMemo, useState } from "react";
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
    const userOptions: Option[] = useMemo(() =>
        userList.map((user) => ({
            label: user.nickName,
            value: user.nickName,
            userName: user.userName,
            dept: user.deptName || "", // Assuming deptName exists, otherwise default empty
        })),
        [userList]);

    const { register, handleSubmit, reset, setValue, watch, control } = useForm<PersonFormValues>({
        defaultValues: {
            no: "",
            name: "",
            dept: "",
            active: "1",
        },
    });

    const [selectedUserOption, setSelectedUserOption] = useState<Option | undefined>(undefined);

    useEffect(() => {
        if (open) {
            if (person) {
                reset({
                    no: person.no,
                    name: person.name,
                    dept: person.dept || "",
                    active: String(person.active),
                });
                // Initialize autocomplete selected option for edit mode if needed
                // Note: userOptions might need to be searched if we want to show it as "selected"
                // But for simple string match:
                const matched = userOptions.find(u => u.label === person.name);
                setSelectedUserOption(matched ? matched : { label: person.name, value: person.name });
            } else {
                reset({
                    no: "",
                    name: "",
                    dept: "",
                    active: "1",
                });
                setSelectedUserOption(undefined);
            }
        }
    }, [open, person, reset, userOptions]);

    const handleClose = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
    };

    const handleNameChange = (nickName: string) => {
        const selectedUser = userList.find((user) => user.nickName === nickName);
        if (selectedUser) {
            setValue("name", selectedUser.nickName);
            setValue("no", selectedUser.userName);
            if (selectedUser.deptName) {
                setValue("dept", selectedUser.deptName);
            }
        }
    };

    const activeValue = watch("active");

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
                            rules={{ required: true }}
                            render={({ field }) => (
                                <AutoComplete
                                    options={userOptions}
                                    placeholder="选择姓名"
                                    emptyMessage="没有匹配的姓名"
                                    value={selectedUserOption}
                                    onValueChange={(option) => {
                                        setSelectedUserOption(option);
                                        field.onChange(option.value);
                                        handleNameChange(option.value);
                                    }}
                                    disabled={!!person} // Disable name edit if editing existing person? Usually identity keys shouldn't change easily.
                                />
                            )}
                        />
                        <input type="hidden" {...register("name", { required: true })} />
                    </div>
                    <div>
                        <Label htmlFor="no" className="mb-2 block">工号</Label>
                        <Input id="no" {...register("no", { required: true })} disabled placeholder="自动填充" />
                    </div>
                    <div>
                        <Label htmlFor="dept" className="mb-2 block">部门</Label>
                        <Input id="dept" {...register("dept")} />
                    </div>
                    <div>
                        <Label className="mb-2 block">状态</Label>
                        <Select
                            value={activeValue}
                            onValueChange={(val) => setValue("active", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">启用</SelectItem>
                                <SelectItem value="0">禁用</SelectItem>
                            </SelectContent>
                        </Select>
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
