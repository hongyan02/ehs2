"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuthDialog } from "@/stores/useAuthDialog";
import Cookies from "js-cookie";

export function AuthExpiredDialog() {
  const { open, closeDialog } = useAuthDialog();

  const handleRelogin = () => {
    Cookies.remove("token");
    localStorage.clear();
    closeDialog();
    window.location.replace("/login");
  };

  return (
    <AlertDialog open={open} onOpenChange={closeDialog}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>登录状态已过期</AlertDialogTitle>
          <AlertDialogDescription>
            您的登录凭证已过期，请重新登录以继续使用系统。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeDialog}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleRelogin}>
            重新登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
