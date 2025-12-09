import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";

// --- Person ---
export function getPointPersonList(params: any) {
    return request.get(API_SERVICE.points.person, { params, headers: { isToken: false } });
}

export function createPointPerson(data: any) {
    return request.post(API_SERVICE.points.person, data, { headers: { isToken: false } });
}

export function updatePointPerson(id: number, data: any) {
    return request.put(`${API_SERVICE.points.person}/${id}`, data, { headers: { isToken: false } });
}

export function deletePointPerson(id: number) {
    return request.delete(`${API_SERVICE.points.person}/${id}`, { headers: { isToken: false } });
}

// --- Categories ---
export function getPointCategoriesList() {
    return request.get(API_SERVICE.points.categories, { headers: { isToken: false } });
}

export function createPointCategory(data: any) {
    return request.post(API_SERVICE.points.categories, data, { headers: { isToken: false } });
}

export function updatePointCategory(id: number, data: any) {
    return request.put(`${API_SERVICE.points.categories}/${id}`, data, { headers: { isToken: false } });
}

export function deletePointCategory(id: number) {
    return request.delete(`${API_SERVICE.points.categories}/${id}`, { headers: { isToken: false } });
}

// --- Events ---
export function getPointEventList(params: any) {
    return request.get(API_SERVICE.points.events, { params, headers: { isToken: false } });
}

export function createPointEvent(data: any) {
    return request.post(API_SERVICE.points.events, data, { headers: { isToken: false } });
}

export function updatePointEvent(id: number, data: any) {
    return request.put(`${API_SERVICE.points.events}/${id}`, data, { headers: { isToken: false } });
}

export function deletePointEvent(id: number) {
    return request.delete(`${API_SERVICE.points.events}/${id}`, { headers: { isToken: false } });
}

// --- Logs ---
export function getPointLogList(params: any) {
    return request.get(API_SERVICE.points.logs, { params, headers: { isToken: false } });
}

export function createPointLog(data: any) {
    return request.post(API_SERVICE.points.logs, data, { headers: { isToken: false } });
}

export function getPointRanking(month: string) {
    return request.get(API_SERVICE.points.ranking, { params: { month }, headers: { isToken: false } });
}
