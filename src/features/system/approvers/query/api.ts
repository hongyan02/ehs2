import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

export interface SystemApprover {
  id: number;
  name: string;
  no: string;
  status: number;
  createTime: string;
  updateTime: string;
}

export const getApprovers = async (): Promise<SystemApprover[]> => {
  const response = await axios.get(`${API_BASE}/system/approvers`);
  return response.data.data;
};

export const createApprover = async (data: Partial<SystemApprover>): Promise<SystemApprover> => {
  const response = await axios.post(`${API_BASE}/system/approvers`, data);
  return response.data.data;
};

export const updateApprover = async (id: number, data: Partial<SystemApprover>): Promise<SystemApprover> => {
  const response = await axios.put(`${API_BASE}/system/approvers/${id}`, data);
  return response.data.data;
};

export const deleteApprover = async (id: number): Promise<SystemApprover> => {
  const response = await axios.delete(`${API_BASE}/system/approvers/${id}`);
  return response.data.data;
};
