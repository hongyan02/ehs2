"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import CustomPagination from "@/components/CustomPagination";
import EventTable, { PointEvent } from "./EventTable";
import EventDialog, { EventFormValues } from "./EventDialog";
import CategoriesDialog from "./CategoriesDialog";
import {
    useCreatePointEvent,
    useDeletePointEvent,
    usePointEventList,
    useUpdatePointEvent,
} from "../query";

export default function EventManagement() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState("");

    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<PointEvent | null>(null);

    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);

    const { data, isLoading } = usePointEventList({
        page,
        pageSize,
        name: searchName,
    });

    const createMutation = useCreatePointEvent();
    const updateMutation = useUpdatePointEvent();
    const deleteMutation = useDeletePointEvent();

    const handleCreate = () => {
        setEditingEvent(null);
        setEventDialogOpen(true);
    };

    const handleEdit = (event: PointEvent) => {
        setEditingEvent(event);
        setEventDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("确认删除该事件吗？")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("删除成功");
        } catch (error) {
            toast.error("删除失败");
        }
    };

    const handleSubmit = async (values: EventFormValues) => {
        const payload = {
            ...values,
            categoryId: parseInt(values.categoryId),
        };

        try {
            if (editingEvent) {
                await updateMutation.mutateAsync({ id: editingEvent.id, data: payload });
                toast.success("更新成功");
            } else {
                await createMutation.mutateAsync(payload);
                toast.success("创建成功");
            }
            setEventDialogOpen(false);
        } catch (error: any) {
            const msg = error?.response?.data?.message || (editingEvent ? "更新失败" : "创建失败");
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
                        placeholder="搜索事件名称"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-40"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCategoriesDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        分类管理
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增事件
                    </Button>
                </div>
            </div>

            <EventTable
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

            <EventDialog
                open={eventDialogOpen}
                onOpenChange={setEventDialogOpen}
                event={editingEvent}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            <CategoriesDialog
                open={categoriesDialogOpen}
                onOpenChange={setCategoriesDialogOpen}
            />
        </div>
    );
}
