"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AutoComplete, type Option } from "@/components/autoCompleteSelect";
import useUserListStore from "@/stores/useUserList";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";
import { lockApplicationStep1Schema } from "@/lib/schemas/lock-application";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Upload, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

interface Step1FormProps {
  onNext: (data: LockApplicationStep1) => void;
  defaultValues?: Partial<LockApplicationStep1>;
}

interface LockConfig {
  id: number;
  type: "department" | "process" | "team";
  name: string;
  code?: string;
  processId?: number;
  managerName?: string;
  managerNo?: string;
  safetyEngineerName?: string;
  safetyEngineerNo?: string;
}

// 将用户列表转换为 AutoComplete 需要的 options 格式
const useUserOptions = () => {
  const { userList } = useUserListStore();

  return useMemo(() => {
    // 使用 Map 去重，以 userId 为 key，保留第一个出现的用户
    const uniqueUsersMap = new Map(userList.map((user) => [user.userId, user]));
    return Array.from(uniqueUsersMap.values()).map((user) => ({
      value: user.userId.toString(),
      label: user.nickName || user.userName,
      userNo: user.userName,
      deptName: user.deptName || "",
    }));
  }, [userList]);
};

// 获取配置数据
const useConfigData = () => {
  const [departments, setDepartments] = useState<LockConfig[]>([]);
  const [processes, setProcesses] = useState<LockConfig[]>([]);
  const [teams, setTeams] = useState<LockConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [deptRes, processRes, teamRes] = await Promise.all([
          axios.get(`${API_BASE}/lock/config?type=department`),
          axios.get(`${API_BASE}/lock/config?type=process`),
          axios.get(`${API_BASE}/lock/config?type=team`),
        ]);
        setDepartments(deptRes.data.data || []);
        setProcesses(processRes.data.data || []);
        setTeams(teamRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch configs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  return { departments, processes, teams, loading };
};

// 审批人选择器组件
function ApproverSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange: (name: string, no: string) => void;
  options: Option[];
}) {
  const handleChange = (option: Option | undefined) => {
    if (option) {
      const userNo = (option as Option & { userNo?: string }).userNo || "";
      onChange(option.label, userNo);
    }
  };

  return (
    <Controller
      name={label as any}
      render={({ field }) => (
        <AutoComplete
          options={options}
          placeholder={placeholder}
          emptyMessage="未找到匹配人员"
          value={value ? { value, label: value } : undefined}
          onValueChange={handleChange}
        />
      )}
    />
  );
}

export default function Step1Form({ onNext, defaultValues }: Step1FormProps) {
  const userOptions = useUserOptions();
  const { departments, processes, teams, loading: configLoading } = useConfigData();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<LockApplicationStep1>({
    resolver: zodResolver(lockApplicationStep1Schema),
    defaultValues: defaultValues || {
      applicantName: "",
      applicantNo: "",
      department: "",
      phone: "",
      productionLine: "",
      process: "",
      team: "",
      certificatePhoto: "",
      leaderName: "",
      leaderNo: "",
      managerName: "",
      managerNo: "",
      safetyOfficerName: "",
      safetyOfficerNo: "",
    },
  });

  const watchCertificatePhoto = watch("certificatePhoto");
  const watchProcess = watch("process");
  const watchTeam = watch("team");

  // 监听工序变化，自动填充经理信息，并清空班组
  useEffect(() => {
    if (watchProcess && processes.length > 0) {
      const processConfig = processes.find((p) => p.name === watchProcess);
      if (processConfig) {
        // 自动填充部门长（经理）信息
        if (processConfig.managerName) {
          setValue("managerName", processConfig.managerName, { shouldValidate: true });
        }
        if (processConfig.managerNo) {
          setValue("managerNo", processConfig.managerNo, { shouldValidate: true });
        }
      }
      // 工序变化时清空班组
      setValue("team", "");
    }
  }, [watchProcess, processes, setValue]);

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("只支持 JPG、PNG、GIF、WebP 格式的图片");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE}/upload/certificate`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setValue("certificatePhoto", response.data.data.url, { shouldValidate: true });
      } else {
        alert(response.data.message || "上传失败");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setValue("certificatePhoto", "");
  };

  const onSubmit = (data: LockApplicationStep1) => {
    onNext(data);
  };

  const handleApproverChange = (
    fieldName: "leaderName" | "managerName" | "safetyOfficerName",
    noFieldName: "leaderNo" | "managerNo" | "safetyOfficerNo",
    name: string,
    userNo: string
  ) => {
    setValue(fieldName, name, { shouldValidate: true });
    setValue(noFieldName, userNo, { shouldValidate: true });
  };

  // 配置选项转换（去重）
  const departmentOptions = useMemo(() => {
    const seen = new Set<string>();
    return departments
      .filter((d) => {
        if (seen.has(d.name)) return false;
        seen.add(d.name);
        return true;
      })
      .map((d) => ({ value: d.name, label: d.name }));
  }, [departments]);

  const processOptions = useMemo(() => {
    const seen = new Set<string>();
    return processes
      .filter((p) => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      })
      .map((p) => ({ value: p.name, label: p.name, code: p.code || "" }));
  }, [processes]);

  // 获取选中工序的 processId
  const selectedProcessId = useMemo(() => {
    if (!watchProcess) return null;
    const processConfig = processes.find((p) => p.name === watchProcess);
    return processConfig?.id || null;
  }, [watchProcess, processes]);

  const teamOptions = useMemo(() => {
    const seen = new Set<string>();
    // 如果选择了工序，则只显示该工序下的班组
    const filteredTeams = selectedProcessId
      ? teams.filter((t) => t.processId === selectedProcessId)
      : teams;
    return filteredTeams
      .filter((t) => {
        if (seen.has(t.name)) return false;
        seen.add(t.name);
        return true;
      })
      .map((t) => ({ value: t.name, label: t.name }));
  }, [teams, selectedProcessId]);

  // 是否有配置数据
  const hasConfigData = departments.length > 0 || processes.length > 0 || teams.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="applicantName">
          申请人姓名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="applicantName"
          placeholder="请输入申请人姓名"
          {...register("applicantName")}
        />
        {errors.applicantName && (
          <p className="text-sm text-red-500">{errors.applicantName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicantNo">
          申请人工号 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="applicantNo"
          placeholder="请输入申请人工号"
          {...register("applicantNo")}
        />
        {errors.applicantNo && (
          <p className="text-sm text-red-500">{errors.applicantNo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">
          部门 <span className="text-red-500">*</span>
        </Label>
        {configLoading ? (
          <Input placeholder="加载中..." disabled />
        ) : hasConfigData && departmentOptions.length > 0 ? (
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : (
          <Input
            id="department"
            placeholder="请输入部门"
            {...register("department")}
          />
        )}
        {errors.department && (
          <p className="text-sm text-red-500">{errors.department.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          联系电话 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          placeholder="请输入联系电话"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="productionLine">所属产线</Label>
        <Input
          id="productionLine"
          placeholder="请输入所属产线"
          {...register("productionLine")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="process">工序</Label>
        {configLoading ? (
          <Input placeholder="加载中..." disabled />
        ) : hasConfigData && processOptions.length > 0 ? (
          <Controller
            name="process"
            control={control}
            render={({ field }) => (
              <AutoComplete
                options={processOptions}
                placeholder="请选择工序"
                emptyMessage="未找到匹配工序"
                value={field.value ? { value: field.value, label: field.value } : undefined}
                onValueChange={(option) => {
                  field.onChange(option?.label || "");
                }}
              />
            )}
          />
        ) : (
          <Input
            id="process"
            placeholder="请输入工序"
            {...register("process")}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="team">班组</Label>
        {configLoading ? (
          <Input placeholder="加载中..." disabled />
        ) : hasConfigData && teamOptions.length > 0 ? (
          <Controller
            name="team"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!watchProcess}
              >
                <SelectTrigger>
                  <SelectValue placeholder={watchProcess ? "请选择班组" : "请先选择工序"} />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : (
          <Input
            id="team"
            placeholder="请输入班组"
            {...register("team")}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificatePhoto">上岗证照片</Label>
        {watchCertificatePhoto ? (
          <div className="relative inline-block">
            <Image
              src={watchCertificatePhoto}
              alt="上岗证"
              width={128}
              height={128}
              className="object-cover rounded border"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                {isUploading ? (
                  <span className="text-sm text-gray-500">上传中...</span>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <span className="text-xs text-gray-500">点击上传</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <span className="text-xs text-gray-500">支持 JPG、PNG、GIF、WebP，不超过 5MB</span>
          </div>
        )}
      </div>

      {/* 上级审批人信息 */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-600 mb-4">上级审批人信息</h3>

        {/* 组长/主管 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label>组长/主管姓名</Label>
            <Controller
              name="leaderName"
              control={control}
              render={({ field }) => (
                <AutoComplete
                  options={userOptions}
                  placeholder="选择或输入组长/主管"
                  emptyMessage="未找到匹配人员"
                  value={field.value ? { value: field.value, label: field.value } : undefined}
                  onValueChange={(option) => {
                    const userNo = (option as Option & { userNo?: string }).userNo || "";
                    field.onChange(option?.label || "");
                    setValue("leaderNo", userNo, { shouldValidate: true });
                  }}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leaderNo">组长/主管工号</Label>
            <Input
              id="leaderNo"
              placeholder="工号"
              {...register("leaderNo")}
            />
          </div>
        </div>

        {/* 部门长 - 填写工序后自动填充 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label>部门长姓名</Label>
            <Controller
              name="managerName"
              control={control}
              render={({ field }) => (
                <AutoComplete
                  options={userOptions}
                  placeholder="选择或输入部门长"
                  emptyMessage="未找到匹配人员"
                  value={field.value ? { value: field.value, label: field.value } : undefined}
                  onValueChange={(option) => {
                    const userNo = (option as Option & { userNo?: string }).userNo || "";
                    field.onChange(option?.label || "");
                    setValue("managerNo", userNo, { shouldValidate: true });
                  }}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerNo">部门长工号</Label>
            <Input
              id="managerNo"
              placeholder="工号"
              {...register("managerNo")}
            />
          </div>
        </div>

        {/* 安环部 - 根据需求可填可不填，由系统设置中配置的人员审批 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>安环部审批人姓名（可选）</Label>
            <Controller
              name="safetyOfficerName"
              control={control}
              render={({ field }) => (
                <AutoComplete
                  options={userOptions}
                  placeholder="选择或输入安环部审批人"
                  emptyMessage="未找到匹配人员"
                  value={field.value ? { value: field.value, label: field.value } : undefined}
                  onValueChange={(option) => {
                    const userNo = (option as Option & { userNo?: string }).userNo || "";
                    field.onChange(option?.label || "");
                    setValue("safetyOfficerNo", userNo, { shouldValidate: true });
                  }}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safetyOfficerNo">安环部审批人工号</Label>
            <Input
              id="safetyOfficerNo"
              placeholder="工号"
              {...register("safetyOfficerNo")}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">下一步</Button>
      </div>
    </form>
  );
}
