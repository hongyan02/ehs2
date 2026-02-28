import { Context } from "hono";
import { cors } from "hono/cors";

// 文件上传目录
const UPLOAD_DIR = "public/uploads/certificates";

// 允许的图片类型
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadController = async (c: Context) => {
  try {
    // 解析 multipart form data
    const body = await c.req.parseBody({
      all: true,
    });

    const file = body.file as File | undefined;

    if (!file) {
      return c.json({ success: false, message: "请选择要上传的文件" }, 400);
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json(
        { success: false, message: "只支持 JPG、PNG、GIF、WebP 格式的图片" },
        400
      );
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return c.json(
        { success: false, message: "图片大小不能超过 5MB" },
        400
      );
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `cert_${timestamp}_${random}.${ext}`;

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
    const fileUrl = `/uploads/certificates/${filename}`;

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
    console.error("uploadController error:", error);
    return c.json({ success: false, message: "上传失败" }, 500);
  }
};
