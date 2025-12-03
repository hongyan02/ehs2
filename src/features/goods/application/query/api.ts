import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

export interface GetApplicationParams {
    page?: number;
    pageSize?: number;
    title?: string;
    applicant?: string;
    status?: number;
    operation?: "IN" | "OUT";
}

export interface ApplicationData {
    id?: number;
    applicationCode: string;
    title: string;
    operation: "IN" | "OUT";
    applicationTime: string;
    applicant: string;
    applicantNo: string;
    approveTime?: string | null;
    approver?: string | null;
    approverNo?: string | null;
    origin?: string | null;
    purpose?: string | null;
    status: number;
    createTime: string;
    updateTime: string;
}

export type ApplicationPayload = Omit<
    ApplicationData,
    "id" | "applicationCode" | "applicationTime" | "approveTime" | "approver" | "approverNo" | "status" | "createTime" | "updateTime"
>;

export function getApplications(params: GetApplicationParams) {
    return request.get(API_SERVICE.application.application, {
        params,
        headers: { isToken: false },
    });
}

export function getApplicationById(id: number) {
    return request.get(`${API_SERVICE.application.application}/${id}`, {
        headers: { isToken: false },
    });
}

export function createApplication(data: ApplicationPayload) {
    return request.post(API_SERVICE.application.application, data, {
        headers: { isToken: false },
    });
}

export function updateApplication(
    id: number,
    data: Partial<ApplicationPayload>,
) {
    return request.put(`${API_SERVICE.application.application}/${id}`, data, {
        headers: { isToken: false },
    });
}

export function deleteApplication(id: number) {
    return request.delete(`${API_SERVICE.application.application}/${id}`, {
        headers: { isToken: false },
    });
}
