import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getPendingApprovals,
  submitApproval,
  getApprovalHistory,
  getLockApplication,
} from "./api";

export const usePendingApprovals = (params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) => {
  return useQuery({
    queryKey: ["lockPendingApprovals", params],
    queryFn: async () => {
      const res = await getPendingApprovals(params);
      return res.data.data;
    },
  });
};

export const useSubmitApproval = () => {
  return useMutation({
    mutationFn: submitApproval,
  });
};

export const useApprovalHistory = (applicationId: number) => {
  return useQuery({
    queryKey: ["lockApprovalHistory", applicationId],
    queryFn: async () => {
      const res = await getApprovalHistory(applicationId);
      return res.data.data;
    },
    enabled: !!applicationId,
  });
};

export const useLockApplication = (id: number) => {
  return useQuery({
    queryKey: ["lockApplication", id],
    queryFn: async () => {
      const res = await getLockApplication(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};
