import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";
import type { LockApplicationStep1, ExamResult, Approval } from "@/lib/schemas/lock-application";

// Lock Application API
export function createLockApplication(data: LockApplicationStep1) {
  return request.post(API_SERVICE.lock.application, data);
}

export function getLockApplication(id: number) {
  return request.get(`${API_SERVICE.lock.application}/${id}`);
}

export function getLockApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return request.get(API_SERVICE.lock.application, { params });
}

export function getMyApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return request.get(API_SERVICE.lock.applicationMy, { params });
}

export function getAllApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return request.get(API_SERVICE.lock.applicationAll, { params });
}

export function getAllLockDetails(params?: {
  page?: number;
  pageSize?: number;
}) {
  return request.get(API_SERVICE.lock.applicationLocks, { params });
}

export function queryApplicationsByEmployeeNo(employeeNo: string) {
  return request.get(`${API_SERVICE.lock.application}/query/${employeeNo}`);
}

// Exam Result API
export function submitExamResult(data: ExamResult) {
  return request.post(API_SERVICE.lock.examResult, data);
}

// Approval API
export function submitApproval(data: Approval) {
  return request.post(API_SERVICE.lock.approval, data);
}

export function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  return request.get(API_SERVICE.lock.approvalPending, { params });
}

// Type exports
export type { LockApplicationStep1, ExamResult, Approval };
