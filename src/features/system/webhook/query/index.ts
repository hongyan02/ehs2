import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebhookConfigs, updateWebhookConfig } from "./api";

export const useWebhookConfigs = () => {
    return useQuery({
        queryKey: ["webhookConfigs"],
        queryFn: getWebhookConfigs,
        select: (res) => res.data.data // Extract the data array: AxiosResponse -> Body -> Data Array
    });
};

export const useUpdateWebhookConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { webhookKey: string; description?: string } }) =>
            updateWebhookConfig(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhookConfigs"] });
        },
    });
};
