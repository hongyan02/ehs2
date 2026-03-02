"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  type LockConfig,
} from "./query/api";

// React Query hooks
const useConfigs = (type?: string) => {
  return useQuery<LockConfig[]>({
    queryKey: ["lockConfigs", type],
    queryFn: async () => {
      const res = await getConfigs(type ? { type } : undefined);
      return res.data.data as LockConfig[];
    },
  });
};

const useCreateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
      toast.success("添加成功");
    },
  });
};

const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LockConfig> }) =>
      updateConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
      toast.success("更新成功");
    },
  });
};

const useDeleteConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lockConfigs"] });
      toast.success("删除成功");
    },
  });
};

// 配置表单组件
function ConfigDialog({
  open,
  onOpenChange,
  config,
  type,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: LockConfig;
  type: "department" | "process" | "team";
  onSubmit: (data: Partial<LockConfig>) => void;
}) {
  const getInitialData = () => ({
    name: config?.name || "",
    code: config?.code || "",
    managerName: config?.managerName || "",
    managerNo: config?.managerNo || "",
    safetyEngineerName: config?.safetyEngineerName || "",
    safetyEngineerNo: config?.safetyEngineerNo || "",
    sortOrder: config?.sortOrder || 0,
    status: config?.status || 1,
  });

  const [formData, setFormData] = useState(getInitialData);

  // 同步外部数据到表单
  if (open && formData.name === "" && config) {
    setFormData({
      name: config.name || "",
      code: config.code || "",
      managerName: config.managerName || "",
      managerNo: config.managerNo || "",
      safetyEngineerName: config.safetyEngineerName || "",
      safetyEngineerNo: config.safetyEngineerNo || "",
      sortOrder: config.sortOrder || 0,
      status: config.status || 1,
    });
  }

  const handleSubmit = () => {
    onSubmit({ ...formData, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config ? "编辑配置" : "新增配置"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入名称"
            />
          </div>

          {type === "process" && (
            <>
              <div className="space-y-2">
                <Label>编码</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入编码"
                />
              </div>
              <div className="space-y-2">
                <Label>责任经理姓名</Label>
                <Input
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="请输入责任经理姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>责任经理工号</Label>
                <Input
                  value={formData.managerNo}
                  onChange={(e) => setFormData({ ...formData, managerNo: e.target.value })}
                  placeholder="请输入责任经理工号"
                />
              </div>
              <div className="space-y-2">
                <Label>安环工程师姓名</Label>
                <Input
                  value={formData.safetyEngineerName}
                  onChange={(e) => setFormData({ ...formData, safetyEngineerName: e.target.value })}
                  placeholder="请输入安环工程师姓名"
                />
              </div>
              <div className="space-y-2">
                <Label>安环工程师工号</Label>
                <Input
                  value={formData.safetyEngineerNo}
                  onChange={(e) => setFormData({ ...formData, safetyEngineerNo: e.target.value })}
                  placeholder="请输入安环工程师工号"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>排序</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 配置表格组件
function ConfigTable({
  configs,
  type,
  onEdit,
  onDelete,
}: {
  configs: LockConfig[];
  type: "department" | "process" | "team";
  onEdit: (config: LockConfig) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>排序</TableHead>
          <TableHead>名称</TableHead>
          {type === "process" && (
            <>
              <TableHead>编码</TableHead>
              <TableHead>责任经理</TableHead>
              <TableHead>经理工号</TableHead>
            </>
          )}
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={type === "process" ? 7 : 4} className="text-center text-gray-500">
              暂无数据
            </TableCell>
          </TableRow>
        ) : (
          configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell>{config.sortOrder}</TableCell>
              <TableCell>{config.name}</TableCell>
              {type === "process" && (
                <>
                  <TableCell>{config.code || "-"}</TableCell>
                  <TableCell>{config.managerName || "-"}</TableCell>
                  <TableCell>{config.managerNo || "-"}</TableCell>
                </>
              )}
              <TableCell>{config.status === 1 ? "启用" : "禁用"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(config)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(config.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default function LockConfigPage() {
  const [activeTab, setActiveTab] = useState("department");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LockConfig | undefined>();

  const { data: deptConfigs } = useConfigs("department");
  const { data: processConfigs } = useConfigs("process");
  const { data: teamConfigs } = useConfigs("team");

  const createMutation = useCreateConfig();
  const updateMutation = useUpdateConfig();
  const deleteMutation = useDeleteConfig();

  const handleEdit = (config: LockConfig) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条配置吗？")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: Partial<LockConfig>) => {
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingConfig(undefined);
  };

  const type = activeTab as "department" | "process" | "team";

  return (
    <div className="container mx-auto py-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">锁具配置管理</h3>
        </div>
        <div className="p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="department">部门配置</TabsTrigger>
                <TabsTrigger value="process">工序配置</TabsTrigger>
                <TabsTrigger value="team">班组配置</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => {
                  setEditingConfig(undefined);
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                新增
              </Button>
            </div>

            <TabsContent value="department">
              <ConfigTable
                configs={deptConfigs || []}
                type="department"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="process">
              <ConfigTable
                configs={processConfigs || []}
                type="process"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="team">
              <ConfigTable
                configs={teamConfigs || []}
                type="team"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={editingConfig}
        type={type}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
