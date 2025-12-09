"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCreatePointCategory, useDeletePointCategory, usePointCategoriesList, useUpdatePointCategory } from "../query";
import { useState } from "react";
import { Loader2, Trash2, Edit, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface CategoriesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CategoriesDialog({ open, onOpenChange }: CategoriesDialogProps) {
    const { data, isLoading } = usePointCategoriesList();
    const createMutation = useCreatePointCategory();
    const updateMutation = useUpdatePointCategory();
    const deleteMutation = useDeletePointCategory();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const handleCreate = async () => {
        if (!newName) return;
        try {
            await createMutation.mutateAsync({ categoryName: newName, description: newDesc });
            setNewName("");
            setNewDesc("");
            setIsCreating(false);
            toast.success("创建成功");
        } catch (e) {
            toast.error("创建失败");
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName) return;
        try {
            await updateMutation.mutateAsync({ id, data: { categoryName: editName, description: editDesc } });
            setEditingId(null);
            toast.success("更新成功");
        } catch (e) {
            toast.error("更新失败");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("确认删除该分类吗？")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("删除成功");
        } catch (e) {
            toast.error("删除失败");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>积分分类管理</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>名称</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead className="w-[100px]">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin inline" /></TableCell>
                                </TableRow>
                            ) : data?.data?.data?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {editingId === item.id ? (
                                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        ) : item.categoryName}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === item.id ? (
                                            <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                                        ) : item.description}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === item.id ? (
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => handleUpdate(item.id)}><Save className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    setEditingId(item.id);
                                                    setEditName(item.categoryName);
                                                    setEditDesc(item.description || "");
                                                }}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Creating Row */}
                            {isCreating && (
                                <TableRow>
                                    <TableCell>
                                        <Input placeholder="名称" value={newName} onChange={(e) => setNewName(e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <Input placeholder="描述" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={handleCreate}><Save className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setIsCreating(false)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="pt-4 border-t flex justify-between">
                    {!isCreating && <Button variant="outline" onClick={() => setIsCreating(true)}><Plus className="mr-2 h-4 w-4" />新增分类</Button>}
                    <Button onClick={() => onOpenChange(false)}>关闭</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
