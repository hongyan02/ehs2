import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

const lockApi = axios.create({
  baseURL: API_BASE,
});

export async function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  const response = await lockApi.get("/lock/approval/pending", { params });
  return response.data;
}

export async function submitApproval(data: {
  applicationId: number;
  status: "approve" | "reject";
  comment?: string;
  approvalLevel: number;
}) {
  const response = await lockApi.post("/lock/approval", data);
  return response.data;
}

export async function getApprovalHistory(applicationId: number) {
  const response = await lockApi.get(`/lock/approval/history/${applicationId}`);
  return response.data;
}

export async function getLockApplication(id: number) {
  const response = await lockApi.get(`/lock/application/${id}`);
  return response.data;
}

// React Query Hooks
export function usePendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  return useQuery({
    queryKey: ["lockPendingApprovals", params],
    queryFn: () => getPendingApprovals(params),
  });
}

export function useSubmitApproval() {
  return useMutation({
    mutationFn: submitApproval,
  });
}

export function useApprovalHistory(applicationId: number) {
  return useQuery({
    queryKey: ["lockApprovalHistory", applicationId],
    queryFn: () => getApprovalHistory(applicationId),
    enabled: !!applicationId,
  });
}

export function useLockApplication(id: number) {
  return useQuery({
    queryKey: ["lockApplication", id],
    queryFn: () => getLockApplication(id),
    enabled: !!id,
  });
}

import { useMutation } from "@tanstack/react-query";
