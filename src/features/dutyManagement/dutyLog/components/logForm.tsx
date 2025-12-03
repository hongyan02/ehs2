"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TiptapEditor } from "@/components/TiptapEditor";
import type { DutyLogData } from "../query";
import useInfoStore from "@/stores/useUserInfo";

const DEFAULT_DUTY_LOG = [
  "<p>巡查地点：</p>",
  "<p>巡查时间：</p>",
  "<p>发现隐患项：</p>",
  "<p>整改情况：</p>",
  "<p>当天发生的未遂事件、事故征兆或安全事故：</p>",
  "<p>当天作出的重要决定：</p>",
].join("");

const formSchema = z.object({
  date: z.string().min(1, "日期不能为空"),
  shift: z.string().min(1, "班次不能为空"),
  name: z.string().min(1, "姓名不能为空"),
  no: z.string().min(1, "工号不能为空"),
  log: z.string().min(1, "日志内容不能为空"),
  todo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface LogFormProps {
  defaultValues?: Partial<DutyLogData>;
  onSubmit: (data: DutyLogData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export default function LogForm({
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
}: LogFormProps) {
  const { nickname, username } = useInfoStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      shift: defaultValues?.shift !== undefined ? String(defaultValues.shift) : "0",
      name: defaultValues?.name || nickname,
      no: defaultValues?.no || username,
      log: defaultValues?.log || DEFAULT_DUTY_LOG,
      todo: defaultValues?.todo || "",
    },
  });

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      no: values.no,
      date: values.date,
      shift: Number(values.shift),
      log: values.log,
      todo: values.todo || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 顶部区域: 日期、班次、姓名、工号 - 一行显示 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            日期 <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            {...register("date")}
            className={errors.date ? "border-red-500" : ""}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            班次 <span className="text-red-500">*</span>
          </label>
          <Controller
            name="shift"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                  <SelectValue placeholder="请选择班次" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">白班</SelectItem>
                  <SelectItem value="1">夜班</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.shift && (
            <p className="text-sm text-red-500">{errors.shift.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            姓名 <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="请输入姓名"
            className={errors.name ? "border-red-500" : ""}
            disabled
            readOnly
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            工号 <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("no")}
            placeholder="请输入工号"
            className={errors.no ? "border-red-500" : ""}
            disabled
            readOnly
          />
          {errors.no && (
            <p className="text-sm text-red-500">{errors.no.message}</p>
          )}
        </div>
      </div>

      {/* 中间区域: 富文本编辑器 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          日志内容 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="log"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              value={field.value}
              onContentChangeAction={field.onChange}
              placeholder="请输入日志内容"
              className={errors.log ? "border-red-500" : ""}
            />
          )}
        />
        {errors.log && (
          <p className="text-sm text-red-500">{errors.log.message}</p>
        )}
      </div>

      {/* 底部区域: 待办事项 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">待办事项</label>
        <Input
          {...register("todo")}
          placeholder="请输入待办事项(可选)"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
