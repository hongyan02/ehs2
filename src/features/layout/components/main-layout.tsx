"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import useInfo from "@/stores/useUserInfo";
import { getUserInfo } from "@/features/auth/query/api";
import { useUserList } from "@/features/auth/query";
import useUserListStore from "@/stores/useUserList";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { setInfo, clearInfo } = useInfo();
  const { data: userListData } = useUserList();
  const { setUserList } = useUserListStore();

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      clearInfo?.();
      return;
    }

    (async () => {
      try {
        const userInfo = await getUserInfo();

        setInfo({
          username: userInfo.userName,
          nickname: userInfo.nickName,
          deptName: userInfo.deptName,
        });
      } catch (error) {
        console.error("获取用户信息失败:", error);
        Cookies.remove("token");
        clearInfo?.();
      }
    })();
  }, [setInfo, clearInfo]);

  // 当用户列表数据更新时,存储到store
  useEffect(() => {
    if (userListData?.data) {
      const rawData = userListData.data as any;
      // console.log('原始用户列表数据:', rawData);
      const dataArray = Array.isArray(rawData) ? rawData : (rawData.rows || []);
      // console.log('处理后的数据数组:', dataArray);
      const users = dataArray.map((item: any) => ({
        userId: item.userId,
        userName: item.userName,
        nickName: item.nickName,
        deptId: item.deptId,
        deptName: item.dept?.deptName,
        email: item.email,
        phonenumber: item.phonenumber,
      }));
      // console.log('转换后存储到store的用户列表:', users);
      setUserList(users);
    }
  }, [userListData, setUserList]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-4 p-4">
          <SidebarTrigger className="-ml-1" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
