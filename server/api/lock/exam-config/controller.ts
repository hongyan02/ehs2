import { Context } from "hono";
import { z } from "zod";
import {
  getExamConfig,
  getAllExamConfigs,
  saveExamConfig,
  uploadPracticeFile,
} from "./services";

// Zod schemas
const saveExamConfigSchema = z.object({
  courseUrl: z.string().optional().or(z.literal("")),
  passingScore: z.number().min(0).max(100).optional(),
  practiceFileUrl: z.string().optional(),
  remark: z.string().optional(),
});

export const getExamConfigController = async (c: Context) => {
  const config = await getExamConfig();
  return c.json({ success: true, data: config });
};

export const getAllExamConfigsController = async (c: Context) => {
  const configs = await getAllExamConfigs();
  return c.json({ success: true, data: configs });
};

export const saveExamConfigController = async (c: Context) => {
  const body = await c.req.json();
  const data = saveExamConfigSchema.parse(body);
  const config = await saveExamConfig(data);
  return c.json({ success: true, data: config });
};

// 上传实操考核文件
export const uploadPracticeFileController = async (c: Context) => {
  try {
    // 解析 multipart form data
    const body = await c.req.parseBody({
      all: true,
    });

    const file = body.file as File | undefined;

    if (!file) {
      return c.json({ success: false, message: "请选择要上传的文件" }, 400);
    }

    // 允许的文件类型（文档类）
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    // 验证文件类型（也允许图片类型）
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const allAllowedTypes = [...ALLOWED_TYPES, ...imageTypes];

    if (!allAllowedTypes.includes(file.type)) {
      return c.json(
        { success: false, message: "只支持 PDF、Word、Excel、图片格式" },
        400
      );
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return c.json(
        { success: false, message: "文件大小不能超过 20MB" },
        400
      );
    }

    // 文件上传目录
    const UPLOAD_DIR = "public/uploads/practice";

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "pdf";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `practice_${timestamp}_${random}.${ext}`;

    // 确保目录存在
    const fs = await import("fs");
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // 读取文件内容并保存
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filepath = `${UPLOAD_DIR}/${filename}`;
    fs.writeFileSync(filepath, buffer);

    // 返回文件访问 URL
    const fileUrl = `/uploads/practice/${filename}`;

    // 保存到考试配置
    await uploadPracticeFile({ url: fileUrl, filename });

    return c.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("uploadPracticeFileController error:", error);
    return c.json({ success: false, message: "上传失败" }, 500);
  }
};
