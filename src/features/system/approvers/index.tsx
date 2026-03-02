"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getApprovers,
  createApprover,
  updateApprover,
  deleteApprover,
  type SystemApprover,
} from "./query/api";

// React Query hooks
const useApprovers = (module?: string, role?: string) => {
  return useQuery({
    queryKey: ["systemApprovers", module, role],
    queryFn: () => getApprovers(module, role),
  });
};

const useCreateApprover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApprover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemApprovers"] });
      toast.success("添加成功");
    },
  });
};

const useUpdateApprover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SystemApprover> }) =>
      updateApprover(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemApprovers"] });
      toast.success("更新成功");
    },
  });
};

const useDeleteApprover = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApprover,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemApprovers"] });
      toast.success("删除成功");
    },
  });
};

// 预定义的模块和角色选项
const MODULE_OPTIONS = [
  { value: "lock", label: "锁具模块" },
  { value: "energy", label: "能源模块" },
  { value: "safety", label: "安全模块" },
];

const ROLE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  lock: [
    { value: "safety", label: "安环部审批" },
    { value: "manager", label: "部门长审批" },
  ],
  energy: [
    { value: "safety", label: "安环部审批" },
    { value: "manager", label: "部门长审批" },
  ],
  safety: [
    { value: "safety", label: "安环部审批" },
    { value: "manager", label: "部门长审批" },
  ],
};

// 审批人员表单组件
function ApproverDialog({
  open,
  onOpenChange,
  approver,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approver?: SystemApprover;
  onSubmit: (data: Partial<SystemApprover>) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    no: "",
    module: "lock",
    role: "safety",
    status: 1,
  });

  useEffect(() => {
    if (approver) {
      setFormData({
        name: approver.name || "",
        no: approver.no || "",
        module: approver.module || "lock",
        role: approver.role || "safety",
        status: approver.status || 1,
      });
    } else {
      setFormData({
        name: "",
        no: "",
        module: "lock",
        role: "safety",
        status: 1,
      });
    }
  }, [approver, open]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  const currentRoleOptions = ROLE_OPTIONS[formData.module] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{approver ? "编辑审批人员" : "新增审批人员"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>姓名 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
            />
          </div>

          <div className="space-y-2">
            <Label>工号 *</Label>
            <Input
              value={formData.no}
              onChange={(e) => setFormData({ ...formData, no: e.target.value })}
              placeholder="请输入工号"
            />
          </div>

          <div className="space-y-2">
            <Label>模块 *</Label>
            <select
              className="w-full h-10 px-3 border rounded-md"
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value, role: ROLE_OPTIONS[e.target.value]?.[0]?.value || "" })}
            >
              {MODULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>角色 *</Label>
            <select
              className="w-full h-10 px-3 border rounded-md"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {currentRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <select
              className="w-full h-10 px-3 border rounded-md"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
            >
              <option value={1}>启用</option>
              <option value={0}>禁用</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.no}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SystemApproverPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApprover, setEditingApprover] = useState<SystemApprover | undefined>();

  const { data: approvers } = useApprovers();

  const createMutation = useCreateApprover();
  const updateMutation = useUpdateApprover();
  const deleteMutation = useDeleteApprover();

  const handleEdit = (approver: SystemApprover) => {
    setEditingApprover(approver);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这个审批人员吗？")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: Partial<SystemApprover>) => {
    if (editingApprover) {
      updateMutation.mutate({ id: editingApprover.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingApprover(undefined);
  };

  const getModuleLabel = (module: string) => {
    return MODULE_OPTIONS.find((m) => m.value === module)?.label || module;
  };

  const getRoleLabel = (module: string, role: string) => {
    return ROLE_OPTIONS[module]?.find((r) => r.value === role)?.label || role;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">审批人员管理</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingApprover(undefined);
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              新增审批人员
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>工号</TableHead>
                <TableHead>模块</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!approvers || approvers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                approvers.map((approver) => (
                  <TableRow key={approver.id}>
                    <TableCell>{approver.name}</TableCell>
                    <TableCell>{approver.no}</TableCell>
                    <TableCell>{getModuleLabel(approver.module)}</TableCell>
                    <TableCell>{getRoleLabel(approver.module, approver.role)}</TableCell>
                    <TableCell>{approver.status === 1 ? "启用" : "禁用"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(approver)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(approver.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApproverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        approver={editingApprover}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
