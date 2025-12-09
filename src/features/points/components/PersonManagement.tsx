"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import CustomPagination from "@/components/CustomPagination";
import PersonTable, { PointPerson } from "./PersonTable";
import PersonDialog, { PersonFormValues } from "./PersonDialog";
import {
    useCreatePointPerson,
    useDeletePointPerson,
    usePointPersonList,
    useUpdatePointPerson,
} from "../query";

export default function PersonManagement() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState("");
    const [searchNo, setSearchNo] = useState("");

    // For dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<PointPerson | null>(null);

    const { data, isLoading } = usePointPersonList({
        page,
        pageSize,
        name: searchName,
        no: searchNo,
    });

    const createMutation = useCreatePointPerson();
    const updateMutation = useUpdatePointPerson();
    const deleteMutation = useDeletePointPerson();

    const handleCreate = () => {
        setEditingPerson(null);
        setDialogOpen(true);
    };

    const handleEdit = (person: PointPerson) => {
        setEditingPerson(person);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("确认删除该人员吗？")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("删除成功");
        } catch (error) {
            toast.error("删除失败");
        }
    };

    const handleSubmit = async (values: PersonFormValues) => {
        const payload = {
            ...values,
            active: parseInt(values.active),
        };

        try {
            if (editingPerson) {
                await updateMutation.mutateAsync({ id: editingPerson.id, data: payload });
                toast.success("更新成功");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("创建成功");
            }
            setDialogOpen(false);
        } catch (error: any) {
            const msg = error?.response?.data?.message || (editingPerson ? "更新失败" : "创建失败");
            // Handle array of errors from Zod if needed, but currently simple string display
            if (Array.isArray(msg)) {
                toast.error(msg[0].message);
            } else {
                toast.error(msg);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="搜索姓名"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-40"
                    />
                    <Input
                        placeholder="搜索工号"
                        value={searchNo}
                        onChange={(e) => setSearchNo(e.target.value)}
                        className="w-40"
                    />
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    新增人员
                </Button>
            </div>

            <PersonTable
                data={data?.data?.data?.list || []}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <CustomPagination
                page={page}
                pageSize={pageSize}
                total={data?.data?.data?.total || 0}
                onChange={setPage}
            />

            <PersonDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                person={editingPerson}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
