const WECHAT_WEBHOOK_ENDPOINT =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send";

export type DutyLogWebhookPayload = {
  key: string;
  content: string;
};

export type WeComWebhookResponse = {
  errcode: number;
  errmsg: string;
  msgid?: string;
};

const buildWebhookUrl = (key: string) => {
  const url = new URL(WECHAT_WEBHOOK_ENDPOINT);
  url.searchParams.set("key", key.trim());
  return url.toString();
};

export const sendDutyLogWebhook = async ({
  key,
  content,
}: DutyLogWebhookPayload): Promise<WeComWebhookResponse> => {
  const trimmedKey = key.trim();
  const trimmedContent = content.trim();

  if (!trimmedKey) {
    throw new Error("Webhook key is required");
  }

  if (!trimmedContent) {
    throw new Error("Webhook content is required");
  }

  const response = await fetch(buildWebhookUrl(trimmedKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content: trimmedContent,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `WeCom webhook request failed with status ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as WeComWebhookResponse;

  if (typeof data.errcode !== "number") {
    throw new Error("Unexpected response from WeCom webhook");
  }

  if (data.errcode !== 0) {
    throw new Error(data.errmsg || "WeCom webhook returned an error");
  }

  return data;
};
