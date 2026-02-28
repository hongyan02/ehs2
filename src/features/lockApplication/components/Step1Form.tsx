"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AutoComplete, type Option } from "@/components/autoCompleteSelect";
import useUserListStore from "@/stores/useUserList";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";
import { lockApplicationStep1Schema } from "@/lib/schemas/lock-application";
import { useMemo, useState } from "react";
import axios from "axios";
import { Upload, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

interface Step1FormProps {
  onNext: (data: LockApplicationStep1) => void;
  defaultValues?: Partial<LockApplicationStep1>;
}

// 将用户列表转换为 AutoComplete 需要的 options 格式
const useUserOptions = () => {
  const { userList } = useUserListStore();

  return useMemo(() => {
    return userList.map((user) => ({
      value: user.userId.toString(), // 使用 userId 作为 value
      label: user.nickName || user.userName, // 显示昵称，如果没有则用工号
      userNo: user.userName, // 工号 = userName
      deptName: user.deptName || "",
    }));
  }, [userList]);
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

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("只支持 JPG、PNG、GIF、WebP 格式的图片");
      return;
    }

    // 验证文件大小 (5MB)
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

  // 删除已上传的照片
  const handleRemovePhoto = () => {
    setValue("certificatePhoto", "");
  };

  const onSubmit = (data: LockApplicationStep1) => {
    onNext(data);
  };

  // 处理审批人选择
  const handleApproverChange = (
    fieldName: "leaderName" | "managerName" | "safetyOfficerName",
    noFieldName: "leaderNo" | "managerNo" | "safetyOfficerNo",
    name: string,
    userNo: string
  ) => {
    setValue(fieldName, name, { shouldValidate: true });
    setValue(noFieldName, userNo, { shouldValidate: true });
  };

  // 监听表单中审批人姓名字段
  const watchLeaderName = watch("leaderName");
  const watchManagerName = watch("managerName");
  const watchSafetyOfficerName = watch("safetyOfficerName");

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
        <Input
          id="department"
          placeholder="请输入部门"
          {...register("department")}
        />
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
        <Input
          id="process"
          placeholder="请输入工序"
          {...register("process")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="team">班组</Label>
        <Input
          id="team"
          placeholder="请输入班组"
          {...register("team")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificatePhoto">上岗证照片</Label>
        {watchCertificatePhoto ? (
          <div className="relative inline-block">
            <img
              src={watchCertificatePhoto}
              alt="上岗证"
              className="w-32 h-32 object-cover rounded border"
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

        {/* 部门长 */}
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

        {/* 安环部 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>安环部审批人姓名</Label>
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
