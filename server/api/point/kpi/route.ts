import { Hono } from "hono";
import { getKpi, syncKpi, createKpiController, updateKpiController } from "./controller";

const app = new Hono();

app.get("/", getKpi);
app.post("/", createKpiController);
app.put("/:id", updateKpiController);
app.post("/sync", syncKpi);

export default app;
