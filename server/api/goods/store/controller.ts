import { Context } from "hono";
import { createMaterial, deleteMaterial, getMaterialList, updateMaterial } from "./services";
import { createMaterialSchema, updateMaterialSchema, searchMaterialSchema } from "./schema";

export const getList = async (c: Context) => {
    const query = c.req.query();
    const parsedQuery = searchMaterialSchema.parse(query);
    const result = await getMaterialList(parsedQuery);
    return c.json({ code: 0, data: result, message: "Success" });
};

export const create = async (c: Context) => {
    const body = await c.req.json();
    const parsedBody = createMaterialSchema.parse(body);
    const result = await createMaterial(parsedBody);
    return c.json({ code: 0, data: result, message: "Success" });
};

export const update = async (c: Context) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const parsedBody = updateMaterialSchema.parse(body);
    const result = await updateMaterial(id, parsedBody);
    return c.json({ code: 0, data: result, message: "Success" });
};

export const remove = async (c: Context) => {
    const id = Number(c.req.param("id"));
    const result = await deleteMaterial(id);
    return c.json({ code: 0, data: result, message: "Success" });
};
