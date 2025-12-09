"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PointLogManagement from "./components/PointLogManagement";
import PersonManagement from "./components/PersonManagement";
import EventManagement from "./components/EventManagement";

export default function PointsView() {
    return (
        <div className="h-full p-6 space-y-6">

            <Tabs defaultValue="logs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="logs">积分日志 & 排行榜</TabsTrigger>
                    <TabsTrigger value="person">人员管理</TabsTrigger>
                    <TabsTrigger value="event">事件管理</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-4">
                    <PointLogManagement />
                </TabsContent>

                <TabsContent value="person" className="space-y-4">
                    <PersonManagement />
                </TabsContent>

                <TabsContent value="event" className="space-y-4">
                    <EventManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}