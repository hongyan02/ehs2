import { Hono } from "hono";
import {
  submitExamResultController,
  getExamResultController,
} from "./controller";

const route = new Hono();

route.post("/result", submitExamResultController);
route.get("/result/:applicationId", getExamResultController);

export default route;
