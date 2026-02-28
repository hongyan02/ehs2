import { Hono } from "hono";
import { uploadController } from "./controller";

const uploadRoute = new Hono();

// 上传证书图片
uploadRoute.post("/certificate", uploadController);

export default uploadRoute;
