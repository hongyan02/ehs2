"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Settings2, GraduationCap, Loader2, Users, Building2, Upload, FileText, Download } from "lucide-react";
import { useRef } from "react";
import {
  useLockConfigs,
  useCreateLockConfig,
  useUpdateLockConfig,
  useDeleteLockConfig,
  useExamConfig,
  useSaveExamConfig,
  useUploadPracticeFile,
  type LockConfig,
} from "./query";

// ============ 加载骨架屏组件 ============
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
            <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
            <TableCell><div className="h-8 w-16 bg-muted animate-pulse rounded" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ============ 部门配置组件 ============
function DepartmentConfigTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LockConfig | undefined>();

  const { data: deptConfigs, isLoading } = useLockConfigs("department");
  const createMutation = useCreateLockConfig();
  const updateMutation = useUpdateLockConfig();
  const deleteMutation = useDeleteLockConfig();

  const [formData, setFormData] = useState({
    name: "",
    sortOrder: 0,
    status: 1,
  });

  const handleSubmit = () => {
    const data = { ...formData, type: "department" as const };
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingConfig(undefined);
    setDialogOpen(false);
  };

  const openDialog = (config?: LockConfig) => {
    if (config) {
      setFormData({
        name: config.name || "",
        sortOrder: config.sortOrder || 0,
        status: config.status || 1,
      });
    } else {
      setFormData({ name: "", sortOrder: 0, status: 1 });
    }
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条配置吗？")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => openDialog()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          新增部门
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-20">排序</TableHead>
                <TableHead>部门名称</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!deptConfigs || deptConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                deptConfigs.map((config) => (
                  <TableRow key={config.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{config.sortOrder}</TableCell>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      <Badge variant={config.status === 1 ? "default" : "secondary"}>
                        {config.status === 1 ? "启用" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingConfig(config);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "编辑部门" : "新增部门"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>部门名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入部门名称"
              />
            </div>
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
                <Select
                  value={String(formData.status)}
                  onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ 工序与班组配置组件 ============
function ProcessTeamConfigTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<LockConfig | undefined>();
  const [editingTeam, setEditingTeam] = useState<LockConfig | undefined>();
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);

  const { data: processConfigs, isLoading: processLoading } = useLockConfigs("process");
  const { data: teamConfigs, isLoading: teamLoading } = useLockConfigs("team");

  const createMutation = useCreateLockConfig();
  const updateMutation = useUpdateLockConfig();
  const deleteMutation = useDeleteLockConfig();

  // 工序表单数据
  const [processForm, setProcessForm] = useState({
    name: "",
    code: "",
    managerName: "",
    managerNo: "",
    safetyEngineerName: "",
    safetyEngineerNo: "",
    sortOrder: 0,
    status: 1,
  });

  // 班组表单数据
  const [teamForm, setTeamForm] = useState({
    name: "",
    sortOrder: 0,
    status: 1,
  });

  // 打开工序对话框
  const openProcessDialog = (process?: LockConfig) => {
    if (process) {
      setProcessForm({
        name: process.name || "",
        code: process.code || "",
        managerName: process.managerName || "",
        managerNo: process.managerNo || "",
        safetyEngineerName: process.safetyEngineerName || "",
        safetyEngineerNo: process.safetyEngineerNo || "",
        sortOrder: process.sortOrder || 0,
        status: process.status || 1,
      });
    } else {
      setProcessForm({
        name: "",
        code: "",
        managerName: "",
        managerNo: "",
        safetyEngineerName: "",
        safetyEngineerNo: "",
        sortOrder: 0,
        status: 1,
      });
    }
    setEditingProcess(process);
    setDialogOpen(true);
  };

  // 打开班组对话框
  const openTeamDialog = (team?: LockConfig) => {
    if (team) {
      setTeamForm({
        name: team.name || "",
        sortOrder: team.sortOrder || 0,
        status: team.status || 1,
      });
    } else {
      setTeamForm({
        name: "",
        sortOrder: 0,
        status: 1,
      });
    }
    setEditingTeam(team);
    setTeamDialogOpen(true);
  };

  const handleProcessSubmit = () => {
    const data = { ...processForm, type: "process" as const };
    if (editingProcess) {
      updateMutation.mutate({ id: editingProcess.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingProcess(undefined);
    setDialogOpen(false);
  };

  const handleTeamSubmit = () => {
    if (!selectedProcessId) return;
    const data = { ...teamForm, type: "team" as const, processId: selectedProcessId };
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingTeam(undefined);
    setTeamDialogOpen(false);
  };

  const handleDeleteProcess = (id: number) => {
    if (confirm("确定要删除这个工序吗？删除后其下的班组也会被删除。")) {
      deleteMutation.mutate(id);
      if (selectedProcessId === id) {
        setSelectedProcessId(null);
      }
    }
  };

  const handleDeleteTeam = (id: number) => {
    if (confirm("确定要删除这个班组吗？")) {
      deleteMutation.mutate(id);
    }
  };

  // 获取选中工序下的班组
  const selectedProcessTeams = teamConfigs?.filter(t => t.processId === selectedProcessId) || [];

  // 选中工序
  const selectedProcess = processConfigs?.find(p => p.id === selectedProcessId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：工序列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            工序配置
          </h3>
          <Button
            size="sm"
            onClick={() => openProcessDialog()}
          >
            <Plus className="h-4 w-4 mr-1" />
            新增工序
          </Button>
        </div>

        {processLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {!processConfigs || processConfigs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                暂无工序配置
              </div>
            ) : (
              processConfigs.map((process) => (
                <Card
                  key={process.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedProcessId === process.id
                    ? "ring-2 ring-primary border-primary"
                    : ""
                    }`}
                  onClick={() => setSelectedProcessId(process.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{process.name}</span>
                          <Badge variant={process.status === 1 ? "default" : "secondary"}>
                            {process.status === 1 ? "启用" : "禁用"}
                          </Badge>
                        </div>
                        {process.code && (
                          <p className="text-sm text-muted-foreground">编码: {process.code}</p>
                        )}
                        <div className="text-sm text-muted-foreground space-y-0.5 pt-2">
                          {process.managerName && (
                            <p>责任经理: {process.managerName} ({process.managerNo})</p>
                          )}
                          {process.safetyEngineerName && (
                            <p>安环工程师: {process.safetyEngineerName} ({process.safetyEngineerNo})</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openProcessDialog(process)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteProcess(process.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* 右侧：班组列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            班组配置
            {selectedProcess && <span className="text-sm font-normal text-muted-foreground">- {selectedProcess.name}</span>}
          </h3>
          <Button
            size="sm"
            disabled={!selectedProcessId}
            onClick={() => openTeamDialog()}
          >
            <Plus className="h-4 w-4 mr-1" />
            新增班组
          </Button>
        </div>

        {!selectedProcessId ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            请先选择左侧的工序
          </div>
        ) : teamLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">排序</TableHead>
                  <TableHead>班组名称</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProcessTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                      暂无班组配置
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedProcessTeams.map((team) => (
                    <TableRow key={team.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{team.sortOrder}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        <Badge variant={team.status === 1 ? "default" : "secondary"}>
                          {team.status === 1 ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => openTeamDialog(team)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 工序对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProcess ? "编辑工序" : "新增工序"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>工序名称 *</Label>
                <Input
                  value={processForm.name}
                  onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
                  placeholder="如：极片"
                />
              </div>
              <div className="space-y-2">
                <Label>编码</Label>
                <Input
                  value={processForm.code}
                  onChange={(e) => setProcessForm({ ...processForm, code: e.target.value })}
                  placeholder="如：JP"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">责任经理（审批人）</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">姓名</Label>
                  <Input
                    value={processForm.managerName}
                    onChange={(e) => setProcessForm({ ...processForm, managerName: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">工号</Label>
                  <Input
                    value={processForm.managerNo}
                    onChange={(e) => setProcessForm({ ...processForm, managerNo: e.target.value })}
                    placeholder="请输入工号"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">安环工程师（审批人）</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">姓名</Label>
                  <Input
                    value={processForm.safetyEngineerName}
                    onChange={(e) => setProcessForm({ ...processForm, safetyEngineerName: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">工号</Label>
                  <Input
                    value={processForm.safetyEngineerNo}
                    onChange={(e) => setProcessForm({ ...processForm, safetyEngineerNo: e.target.value })}
                    placeholder="请输入工号"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={processForm.sortOrder}
                  onChange={(e) => setProcessForm({ ...processForm, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={String(processForm.status)}
                  onValueChange={(value) => setProcessForm({ ...processForm, status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleProcessSubmit} disabled={!processForm.name}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 班组对话框 */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "编辑班组" : "新增班组"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>班组名称 *</Label>
              <Input
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="如：极片A班"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={teamForm.sortOrder}
                  onChange={(e) => setTeamForm({ ...teamForm, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={String(teamForm.status)}
                  onValueChange={(value) => setTeamForm({ ...teamForm, status: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>取消</Button>
            <Button onClick={handleTeamSubmit} disabled={!teamForm.name}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ 考试配置标签页内容 ============
function ExamConfigTab() {
  const { data: config, isLoading } = useExamConfig();
  const saveMutation = useSaveExamConfig();
  const uploadMutation = useUploadPracticeFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    courseUrl: config?.courseUrl || "",
    passingScore: config?.passingScore || 60,
    remark: config?.remark || "",
  });

  const handleEdit = () => {
    setFormData({
      courseUrl: config?.courseUrl || "",
      passingScore: config?.passingScore || 60,
      remark: config?.remark || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDownload = () => {
    if (config?.practiceFileUrl) {
      window.open(config.practiceFileUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 是否有配置数据
  const hasConfig = config && (config.courseUrl || config.passingScore);

  return (
    <div className="max-w-2xl">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">考试配置</h3>
        {!isEditing && (
          <Button onClick={handleEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            修改
          </Button>
        )}
      </div>

      {hasConfig && !isEditing ? (
        // 只读模式 - 显示配置信息
        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">亿纬学堂课程链接</Label>
            <p className="text-sm">
              {config?.courseUrl ? (
                <a
                  href={config.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {config.courseUrl}
                </a>
              ) : (
                <span className="text-muted-foreground">未配置</span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">及格分数</Label>
            <p className="text-sm font-medium">{config?.passingScore || 60} 分</p>
          </div>

          {config?.remark && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">备注</Label>
              <p className="text-sm">{config.remark}</p>
            </div>
          )}
        </div>
      ) : (
        // 编辑模式
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="courseUrl" className="text-sm font-medium">亿纬学堂课程链接</Label>
            <Input
              id="courseUrl"
              value={formData.courseUrl}
              onChange={(e) => setFormData({ ...formData, courseUrl: e.target.value })}
              placeholder="请输入亿纬学堂课程链接"
              className="h-10 max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              用户在待考试阶段可以点击此链接前往亿纬学堂学习课程
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore" className="text-sm font-medium">及格分数</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              max={100}
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 0 })}
              placeholder="请输入及格分数"
              className="h-10 max-w-32"
            />
            <p className="text-xs text-muted-foreground">
              用户考试分数达到此分数视为通过考试
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark" className="text-sm font-medium">备注</Label>
            <Input
              id="remark"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息（可选）"
              className="h-10 max-w-md"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saveMutation.isPending} className="min-w-24">
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                取消
              </Button>
            )}
          </div>
        </form>
      )}

      {/* 实操考核文件上传区域 */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="font-medium mb-4">实操考核文件</h4>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? "上传中..." : "上传文件"}
          </Button>

          {config?.practiceFileUrl && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              下载当前文件
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          支持 PDF、Word、Excel、图片格式，文件大小不超过 20MB
        </p>
        {config?.practiceFileUrl && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            已上传文件
          </p>
        )}
      </div>
    </div>
  );
}

// ============ 主页面组件 ============
export default function LockInfoManagePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="process" className="w-full">
            <TabsList className="mb-6 bg-muted h-11">
              <TabsTrigger
                value="process"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Settings2 className="h-4 w-4" />
                工序与班组
              </TabsTrigger>
              <TabsTrigger
                value="department"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                部门配置
              </TabsTrigger>
              <TabsTrigger
                value="exam"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GraduationCap className="h-4 w-4" />
                考试配置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="process" className="mt-0">
              <ProcessTeamConfigTab />
            </TabsContent>

            <TabsContent value="department" className="mt-0">
              <DepartmentConfigTab />
            </TabsContent>

            <TabsContent value="exam" className="mt-0">
              <ExamConfigTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
