import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { LockApplicationSubmit, ExamResult, Approval } from "@/lib/schemas/lock-application";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

const lockApi = axios.create({
  baseURL: API_BASE,
});

// Lock Application API
export async function createLockApplication(data: LockApplicationSubmit) {
  const response = await lockApi.post("/lock/application", data);
  return response.data;
}

export async function getLockApplication(id: number) {
  const response = await lockApi.get(`/lock/application/${id}`);
  return response.data;
}

export async function getLockApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const response = await lockApi.get("/lock/application", { params });
  return response.data;
}

// Get my applications
export async function getMyApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const response = await lockApi.get("/lock/application/my", { params });
  return response.data;
}

// Get all applications (requires permission)
export async function getAllApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const response = await lockApi.get("/lock/application/all", { params });
  return response.data;
}

// Get all lock details with holder info
export async function getAllLockDetails(params?: {
  page?: number;
  pageSize?: number;
}) {
  const response = await lockApi.get("/lock/application/locks", { params });
  return response.data;
}

// Query applications by employee number (public)
export async function queryApplicationsByEmployeeNo(employeeNo: string) {
  const response = await lockApi.get(`/lock/application/query/${employeeNo}`);
  return response.data;
}

// Exam Result API
export async function submitExamResult(data: ExamResult) {
  const response = await lockApi.post("/lock/exam/result", data);
  return response.data;
}

// Approval API
export async function submitApproval(data: Approval) {
  const response = await lockApi.post("/lock/approval", data);
  return response.data;
}

export async function getPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  const response = await lockApi.get("/lock/approval/pending", { params });
  return response.data;
}

// React Query Hooks
export function useCreateLockApplication() {
  return useMutation({
    mutationFn: createLockApplication,
  });
}

export function useLockApplication(id: number) {
  return useQuery({
    queryKey: ["lockApplication", id],
    queryFn: () => getLockApplication(id),
    enabled: !!id,
  });
}

export function useLockApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["lockApplications", params],
    queryFn: () => getLockApplications(params),
  });
}

export function useMyApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["myLockApplications", params],
    queryFn: () => getMyApplications(params),
  });
}

export function useAllApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["allLockApplications", params],
    queryFn: () => getAllApplications(params),
  });
}

export function useAllLockDetails(params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["allLockDetails", params],
    queryFn: () => getAllLockDetails(params),
  });
}

export function useQueryByEmployeeNo(employeeNo: string) {
  return useQuery({
    queryKey: ["queryByEmployeeNo", employeeNo],
    queryFn: () => queryApplicationsByEmployeeNo(employeeNo),
    enabled: !!employeeNo,
  });
}

export function useSubmitExamResult() {
  return useMutation({
    mutationFn: submitExamResult,
  });
}

export function useSubmitApproval() {
  return useMutation({
    mutationFn: submitApproval,
  });
}

export function usePendingApprovals(params?: {
  page?: number;
  pageSize?: number;
  level?: number;
}) {
  return useQuery({
    queryKey: ["pendingApprovals", params],
    queryFn: () => getPendingApprovals(params),
  });
}

// Type exports for frontend use
export type { LockApplicationSubmit, ExamResult, Approval };
