import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

// Define the shape of WebhookConfig based on schema
export interface WebhookConfig {
    id: number;
    webhookKey: string;
    scene: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export function getWebhookConfigs() {
    return request.get(API_SERVICE.webhook.config, {
        headers: { isToken: false }
    });
}

export function updateWebhookConfig(id: number, data: { webhookKey: string; description?: string }) {
    return request.patch(`${API_SERVICE.webhook.config}/${id}`, data, {
        headers: { isToken: false }
    });
}
