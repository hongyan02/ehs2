"use client";

import React, { useEffect } from "react";
import { Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { encrypt } from "@/utils/jsencrypt";
import Cookies from "js-cookie";
import { useLogin } from "@/features/auth/query";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    if (rememberMe) {
      Cookies.set("rememberMe", "true");
      Cookies.set("username", username);
      // 建议加密后再存
      // Cookies.set("password", encrypt(password));
    } else {
      Cookies.remove("rememberMe");
      Cookies.remove("username");
      // Cookies.remove("password");
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
            <Input
              {...field}
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="账号"
              className="h-12"
            />
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
            <Input.Password
              {...field}
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
              className="h-12"
            />
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
            <Checkbox
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            >
              记住密码
            </Checkbox>
          )}
        />
      </div>

      {/* 登录按钮 */}
      <Button
        type="primary"
        htmlType="submit"
        className="w-full h-12 text-lg font-medium"
        loading={isSubmitting || isPending}
      >
        {isPending ? "登 录 中..." : "登 录"}
      </Button>
    </form>
  );
};
