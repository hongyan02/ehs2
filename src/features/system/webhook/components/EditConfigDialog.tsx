import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { WebhookConfig } from "../query/api";
import { useUpdateWebhookConfig } from "../query";
import { toast } from "sonner"; // Assuming sonner is used for toasts based on typical stack

interface EditConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: WebhookConfig | null;
}

interface WebhookFormValues {
    webhookKey: string;
    description: string;
}

export const EditConfigDialog = ({ open, onOpenChange, config }: EditConfigDialogProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<WebhookFormValues>();
    const updateMutation = useUpdateWebhookConfig();

    useEffect(() => {
        if (config) {
            reset({
                webhookKey: config.webhookKey,
                description: config.description || "",
            });
        }
    }, [config, reset]);

    const onSubmit = (data: WebhookFormValues) => {
        if (!config) return;

        updateMutation.mutate(
            { id: config.id, data },
            {
                onSuccess: () => {
                    toast.success("修改成功");
                    onOpenChange(false);
                },
                onError: (error) => {
                    // Handle error
                    console.error(error);
                    toast.error("修改失败");
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>修改 Webhook 配置</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhookKey">Webhook Key</Label>
                        <Input
                            id="webhookKey"
                            {...register("webhookKey", { required: "请输入 Webhook Key" })}
                            placeholder="请输入 Webhook Key"
                        />
                        {errors.webhookKey && (
                            <p className="text-sm text-red-500">{errors.webhookKey.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="请输入描述"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            取消
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            确定
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
