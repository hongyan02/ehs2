import { Hono } from "hono";
import { getList, create, update, remove } from "./controller";

const app = new Hono();

app.get("/", getList);
app.post("/", create);
app.put("/:id", update);
app.delete("/:id", remove);

export default app;
