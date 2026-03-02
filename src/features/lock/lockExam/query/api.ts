import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface ExamConfig {
  id: number;
  courseUrl?: string;
  passingScore: number;
}

export interface ExamResult {
  id: number;
  applicationId: number;
  passed: boolean;
  score: number;
  examDate: string;
  remark?: string;
  screenshotUrl?: string;
  createTime: string;
}

export function getExamConfig() {
  return request.get(API_SERVICE.lock.examConfig);
}

export function getExamResult(applicationId: number) {
  return request.get(`${API_SERVICE.lock.examResult}/${applicationId}`);
}

export function submitExamResult(data: {
  applicationId: number;
  passed: boolean;
  score: number;
  examDate: string;
  remark?: string;
  screenshotUrl?: string;
}) {
  return request.post(API_SERVICE.lock.examResult, data);
}

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("/api/upload/certificate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
