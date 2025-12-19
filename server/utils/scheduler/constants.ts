export const SUPPORTED_JOB_KEYS = [
    "send-duty-leader-text",
    "send-duty-schedule-webhook",
    "send-duty-log-inspection-webhook",
] as const;
export type SupportedJobKey = (typeof SUPPORTED_JOB_KEYS)[number];
