"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useLogin } from "@/features/auth/query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Lock, User } from "lucide-react";
import { encrypt } from "@/utils/jsencrypt.client";

interface LoginFormProps {
  initialUsername?: string;
  initialPassword?: string;
  initialRememberMe?: boolean;
}

// ✅ Zod 表单验证规则
const formSchema = z.object({
  username: z.string().min(1, { message: "请输入您的账号" }),
  password: z.string().min(1, { message: "请输入您的密码" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const LoginForm: React.FC<LoginFormProps> = ({
  initialUsername,
  initialPassword,
  initialRememberMe,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: initialUsername ?? "",
      password: initialPassword ?? "",
      rememberMe: initialRememberMe ?? false,
    },
  });
  const { mutate: login, isPending, error } = useLogin();
  const errorMessage = error?.message;
  // ✅ 初始值回填
  useEffect(() => {
    if (initialUsername) setValue("username", initialUsername);
    if (initialPassword) setValue("password", initialPassword);
    if (typeof initialRememberMe === "boolean")
      setValue("rememberMe", initialRememberMe);
  }, [initialUsername, initialPassword, initialRememberMe, setValue]);

  // ✅ 只负责UI，不处理登录逻辑
  const onSubmit = (values: LoginFormValues) => {
    const { username, password, rememberMe } = values;
    const cookieOptions = { expires: 7, path: "/" } as const;
    if (rememberMe) {
      Cookies.set("rememberMe", "true", cookieOptions);
      Cookies.set("username", username, cookieOptions);
      const encryptedPassword = encrypt(password);
      const isEncrypted = typeof encryptedPassword === "string";
      Cookies.set("passwordEncrypted", isEncrypted ? "true" : "false", cookieOptions);
      Cookies.set("password", isEncrypted ? encryptedPassword : password, cookieOptions);
    } else {
      const removeOptions = { path: "/" } as const;
      Cookies.remove("rememberMe", removeOptions);
      Cookies.remove("username", removeOptions);
      Cookies.remove("passwordEncrypted", removeOptions);
      Cookies.remove("password", removeOptions);
    }
    login({
      username,
      password,
    });
    console.log("Form submitted:", values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="login-form w-full max-w-[400px] mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-lg"
    >
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertTitle>登录失败</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hello !</h1>
        <h1 className="text-3xl text-gray-600">欢迎来到 EHS 系统！</h1>
      </div>

      {/* 用户名 */}
      <div className="mb-4">
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input {...field} placeholder="账号" className="h-12 pl-10" />
            </div>
          )}
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
        )}
      </div>

      {/* 密码 */}
      <div className="mb-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...field}
                type="password"
                placeholder="密码"
                className="h-12 pl-10"
              />
            </div>
          )}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* 记住密码 */}
      <div className="mb-6">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <Label htmlFor="rememberMe">记住密码</Label>
            </div>
          )}
        />
      </div>

      {/* 登录按钮 */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-medium bg-sky-500 hover:bg-sky-500/70"
        disabled={isSubmitting || isPending}
      >
        {(isSubmitting || isPending) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isPending ? "登 录 中..." : "登 录"}
      </Button>
    </form>
  );
};
