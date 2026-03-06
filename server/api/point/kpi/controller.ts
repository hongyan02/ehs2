import { Context } from "hono";
import { getKpiList, syncKpiList, createKpiRecord, updateKpiRecord } from "./service";

export const getKpi = async (c: Context) => {
    const year = c.req.query("year") || "2025";
    const result = await getKpiList(year);
    return c.json({ data: result });
};

export const syncKpi = async (c: Context) => {
    const body = await c.req.json();

    // Validate body if strictly needed, but since it comes from trusted API via frontend relay, loose validation is okay.
    // However, let's try to parse if possible, or just pass to service.
    // The body from frontend is likely { data: [...] } or just [...]
    // User said "Clicking button calls selectKpi requesting data writing to database".

    // Let's assume the frontend sends the array directly or inside a field.
    // Re-reading request: "Frontend... button Sync KPI, click calls selectKpi (frontend calls external API), then writes needed data to database (frontend calls our sync API)."

    const data = Array.isArray(body) ? body : body.data;

    if (!data || !Array.isArray(data)) {
        return c.json({ error: "Invalid data format" }, 400);
    }

    const result = await syncKpiList(data);
    return c.json(result);
};

export const createKpiController = async (c: Context) => {
    try {
        const body = await c.req.json();
        const result = await createKpiRecord(body);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "创建失败," + error }, 500);
    }
};

export const updateKpiController = async (c: Context) => {
    try {
        const id = parseInt(c.req.param("id") || "");
        const body = await c.req.json();
        const result = await updateKpiRecord(id, body);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, message: "更新失败," + error }, 500);
    }
};
