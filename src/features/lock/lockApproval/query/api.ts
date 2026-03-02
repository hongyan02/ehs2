import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  return request.get(API_SERVICE.lock.approvalPending, { params });
}

export function submitApproval(data: {
  applicationId: number;
  status: "approve" | "reject";
  comment?: string;
  approvalLevel: number;
  approverName?: string;
}) {
  return request.post(API_SERVICE.lock.approval, data);
}

export function getApprovalHistory(applicationId: number) {
  return request.get(`${API_SERVICE.lock.approval}/history/${applicationId}`);
}

export function getLockApplication(id: number) {
  return request.get(`${API_SERVICE.lock.application}/${id}`);
}
