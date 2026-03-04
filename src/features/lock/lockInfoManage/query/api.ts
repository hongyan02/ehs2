import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface LockConfig {
  id: number;
  type: "department" | "process" | "team";
  name: string;
  code?: string;
  processId?: number;
  managerName?: string;
  managerNo?: string;
  safetyEngineerName?: string;
  safetyEngineerNo?: string;
  sortOrder: number;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface LockExamConfig {
  id: number;
  courseUrl?: string;
  passingScore: number;
  status: number;
  remark?: string;
  practiceFileUrl?: string;
  createTime: string;
  updateTime: string;
}

// Lock Config API
export function getConfigs(params?: { type?: string }) {
  return request.get(API_SERVICE.lock.config, { params });
}

export function getProcessConfigs() {
  return request.get(API_SERVICE.lock.configProcesses);
}

export function createConfig(data: Partial<LockConfig>) {
  return request.post(API_SERVICE.lock.config, data);
}

export function updateConfig(id: number, data: Partial<LockConfig>) {
  return request.put(`${API_SERVICE.lock.config}/${id}`, data);
}

export function deleteConfig(id: number) {
  return request.delete(`${API_SERVICE.lock.config}/${id}`);
}

// Exam Config API
export function getExamConfig() {
  return request.get(API_SERVICE.lock.examConfig);
}

export function saveExamConfig(data: {
  courseUrl?: string;
  passingScore?: number;
  remark?: string;
}) {
  return request.post(API_SERVICE.lock.examConfig, data);
}

// 上传实操考核文件
export function uploadPracticeFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request.post(API_SERVICE.lock.examConfigPracticeFile, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
