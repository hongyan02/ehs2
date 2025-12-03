import { useQuery } from "@tanstack/react-query";
import { getMaterialList } from "./api";
import type { SearchMaterialParams } from "./api";


export const useMaterialList = (params: SearchMaterialParams) => {
    return useQuery({
        queryKey: ["materialList", params],
        queryFn: () => getMaterialList(params),
    });
};
