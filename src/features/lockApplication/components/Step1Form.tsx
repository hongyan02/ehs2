"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";
import { lockApplicationStep1Schema } from "@/lib/schemas/lock-application";

interface Step1FormProps {
  onNext: (data: LockApplicationStep1) => void;
  defaultValues?: Partial<LockApplicationStep1>;
}

export default function Step1Form({ onNext, defaultValues }: Step1FormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LockApplicationStep1>({
    resolver: zodResolver(lockApplicationStep1Schema),
    defaultValues: defaultValues || {
      applicantName: "",
      applicantNo: "",
      department: "",
      phone: "",
      applyUnit: "",
    },
  });

  const onSubmit = (data: LockApplicationStep1) => {
    onNext(data);
  };

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

      <div className="flex justify-end">
        <Button type="submit">下一步</Button>
      </div>
    </form>
  );
}
