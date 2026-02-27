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
import { useMemo } from "react";

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
      applyUnit: "",
      leaderName: "",
      leaderNo: "",
      managerName: "",
      managerNo: "",
      safetyOfficerName: "",
      safetyOfficerNo: "",
    },
  });

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
        <Label htmlFor="applyUnit">
          申请单位 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="applyUnit"
          placeholder="请输入申请单位"
          {...register("applyUnit")}
        />
        {errors.applyUnit && (
          <p className="text-sm text-red-500">{errors.applyUnit.message}</p>
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
