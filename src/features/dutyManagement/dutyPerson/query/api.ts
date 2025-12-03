import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface GetDutyPersonParams {
  page?: number;
  pageSize?: number;
  name?: string;
  no?: string;
  shift?: number;
}

export interface DutyPersonData {
  id?: number;
  name: string;
  no: string;
  position?: string | null;
  shift: number;
  phone?: string | null;
}

export type DutyPersonPayload = Omit<DutyPersonData, "id">;

export function getDutyPersons(params: GetDutyPersonParams) {
  return request.get(API_SERVICE.dutyPerson.dutyPerson, {
    params,
    headers: { isToken: false },
  });
}

export function getDutyPersonById(id: number) {
  return request.get(`${API_SERVICE.dutyPerson.dutyPerson}/${id}`, {
    headers: { isToken: false },
  });
}

export function createDutyPerson(data: DutyPersonPayload) {
  return request.post(API_SERVICE.dutyPerson.dutyPerson, data, {
    headers: { isToken: false },
  });
}

export function updateDutyPerson(
  id: number,
  data: Partial<DutyPersonPayload>,
) {
  return request.put(`${API_SERVICE.dutyPerson.dutyPerson}/${id}`, data, {
    headers: { isToken: false },
  });
}

export function deleteDutyPerson(id: number) {
  return request.delete(`${API_SERVICE.dutyPerson.dutyPerson}/${id}`, {
    headers: { isToken: false },
  });
}
