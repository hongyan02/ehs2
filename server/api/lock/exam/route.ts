import { Hono } from "hono";
import {
  submitExamResultController,
  getExamResultController,
  applyPracticeExamController,
  submitPracticeResultController,
} from "./controller";

const route = new Hono();

route.post("/result", submitExamResultController);
route.get("/result/:applicationId", getExamResultController);
// 申请实操考核
route.post("/practice/:applicationId", applyPracticeExamController);
// 提交实操考核结果
route.post("/practice-result", submitPracticeResultController);

export default route;
