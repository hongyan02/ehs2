import request from "@/utils/request";
import { API_SERVICE } from "@/config/api";


export interface SearchMaterialParams {
    materialName?: string;
    materialCode?: string;
    type?: string;
    supplier?: string;
    page?: number;
    pageSize?: number;
}

export interface MaterialData {
    id: number;
    materialCode: string;
    materialName: string;
    spec?: string;
    unit: string;
    num: number;
    threshold: number;
    type?: string;
    location?: string;
    supplier?: string;
    createTime: string;
    updateTime: string;
}

export const getMaterialList = (params: SearchMaterialParams) => {
    return request.get(API_SERVICE.materialStore.store, {
        params,
        headers: { isToken: false },
    });
};