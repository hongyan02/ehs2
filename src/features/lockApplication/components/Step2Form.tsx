"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import type { LockApplicationStep2 } from "@/lib/schemas/lock-application";

interface Step2FormProps {
  onNext: (data: LockApplicationStep2[]) => void;
  onPrev: () => void;
  defaultValues?: LockApplicationStep2[];
}

const LOCK_TYPES = ["普通锁", "防爆锁", "电气锁", "机械锁", "其他"] as const;

export default function Step2Form({ onNext, onPrev, defaultValues }: Step2FormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ lockDetails: LockApplicationStep2[] }>({
    defaultValues: {
      lockDetails: defaultValues || [
        {
          lockType: "普通锁",
          specification: "",
          quantity: 1,
          purpose: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lockDetails",
  });

  const onSubmit = (data: { lockDetails: LockApplicationStep2[] }) => {
    onNext(data.lockDetails);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>锁具明细 <span className="text-red-500">*</span></Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                lockType: "普通锁",
                specification: "",
                quantity: 1,
                purpose: "",
              })
            }
          >
            添加锁具
          </Button>
        </div>

        {errors.lockDetails && typeof errors.lockDetails.message === "string" && (
          <p className="text-sm text-red-500">{errors.lockDetails.message}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">锁具 {index + 1}</span>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  删除
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  锁具类型 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch(`lockDetails.${index}.lockType`)}
                  onValueChange={(value) =>
                    setValue(`lockDetails.${index}.lockType`, value as LockApplicationStep2["lockType"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择锁具类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lockDetails?.[index]?.lockType && (
                  <p className="text-sm text-red-500">
                    {errors.lockDetails[index]?.lockType?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>规格型号</Label>
                <Input
                  placeholder="请输入规格型号"
                  {...register(`lockDetails.${index}.specification`)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  数量 <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  {...register(`lockDetails.${index}.quantity`, { valueAsNumber: true })}
                />
                {errors.lockDetails?.[index]?.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.lockDetails[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>用途说明</Label>
                <Textarea
                  placeholder="请输入用途说明"
                  {...register(`lockDetails.${index}.purpose`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          上一步
        </Button>
        <Button type="submit">下一步</Button>
      </div>
    </form>
  );
}
