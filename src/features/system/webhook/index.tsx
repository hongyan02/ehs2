"use client";

import { useWebhookConfigs } from "./query";
import { ConfigTable } from "./components/ConfigTable";
import { EditConfigDialog } from "./components/EditConfigDialog";
import { useState } from "react";
import { WebhookConfig } from "./query/api";
import { Loader2 } from "lucide-react";

export default function WebhookView() {
    const { data: configs, isLoading } = useWebhookConfigs();
    const [editConfig, setEditConfig] = useState<WebhookConfig | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEdit = (config: WebhookConfig) => {
        setEditConfig(config);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="rounded-md border bg-white">
                <ConfigTable data={configs || []} onEdit={handleEdit} />
            </div>

            <EditConfigDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                config={editConfig}
            />
        </div>
    );
}