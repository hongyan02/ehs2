"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, Upload, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useExamConfig,
  useExamResult,
  useSubmitExamResult,
  useUploadImage,
} from "@/features/lock/lockExam/query";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = parseInt(params.applicationId as string);

  const handleBack = () => {
    router.back();
  };

  const { data: examConfig, isLoading: configLoading } = useExamConfig();
  const { data: examResult, isLoading: resultLoading, refetch } = useExamResult(applicationId);
  const submitMutation = useSubmitExamResult();
  const uploadMutation = useUploadImage();

  const [score, setScore] = useState(0);
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");

  const showAlert = (message: string, type: "error" | "success" = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  useEffect(() => {
    if (examResult) {
      setScore(examResult.score);
      setExamDate(examResult.examDate);
      setScreenshotUrl(examResult.screenshotUrl || "");
    }
  }, [examResult]);

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showAlert("只支持 JPG、PNG、GIF、WebP 格式的图片");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadMutation.mutateAsync(file);
      const url = res.data?.data || res.data?.url || "";
      setScreenshotUrl(url);
      showAlert("截图上传成功", "success");
    } catch {
      showAlert("截图上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!examConfig) {
      showAlert("考试配置不存在");
      return;
    }

    if (score < 0 || score > 100) {
      showAlert("请输入有效的考试分数");
      return;
    }

    const passed = score >= examConfig.passingScore;

    // 考试未通过，只提示不提交
    if (!passed) {
      showAlert(`考试分数未达到及格标准（${examConfig.passingScore}分），请重新考试`);
      return;
    }

    // 考试通过，提交到API
    submitMutation.mutate({
      applicationId,
      passed,
      score,
      examDate,
      screenshotUrl: screenshotUrl || undefined,
    }, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const hasSubmitted = examResult !== null && examResult !== undefined;

  if (configLoading || resultLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          加载中...
        </div>
      </div>
    );
  }

  if (!examConfig) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="py-10 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <p className="text-gray-500">暂未配置考试信息，请联系管理员</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-2">亿纬学堂考试</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground">
          请先前往亿纬学堂学习课程，然后填写考试分数
        </p>

        {/* 课程链接 */}
        {examConfig.courseUrl && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">亿纬学堂课程链接</p>
                <p className="text-sm text-blue-700">点击下方按钮前往学习课程</p>
              </div>
              <a
                href={examConfig.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                前往学习
              </a>
            </div>
          </div>
        )}

        {/* 考试要求 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">考试要求</p>
          <p className="text-sm text-gray-600 mt-1">
            及格分数：<span className="font-bold text-orange-600">{examConfig.passingScore}分</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            考试分数达到 {examConfig.passingScore} 分及以上视为通过
          </p>
        </div>

        {/* 已通过状态 */}
        {hasSubmitted && (
          <div className="p-4 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">考试通过</span>
            </div>
            <p className="text-sm mt-1">
              考试分数：{examResult!.score}分 | 考试日期：{examResult!.examDate}
            </p>
          </div>
        )}

        {/* 提交表单 */}
        {!hasSubmitted && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>考试分数 <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                placeholder="请输入考试分数"
              />
            </div>

            <div className="space-y-2">
              <Label>考试日期 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>考试截图（可选）</Label>
              {screenshotUrl ? (
                <div className="relative inline-block">
                  <Image
                    src={screenshotUrl}
                    alt="考试截图"
                    width={192}
                    height={192}
                    className="w-48 h-48 object-cover rounded border"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotUrl("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      {isUploading ? (
                        <span className="text-sm text-gray-500">上传中...</span>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-gray-400" />
                          <span className="text-xs text-gray-500">点击上传</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleScreenshotChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-xs text-gray-500">支持 JPG、PNG、GIF、WebP，不超过 5MB</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending || score < 0 || score > 100}
              >
                {submitMutation.isPending ? "提交中..." : "提交考试结果"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 提示对话框 */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={alertType === "error" ? "text-red-600" : "text-green-600"}>
              {alertType === "error" ? "提示" : "成功"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-4">{alertMessage}</p>
          <DialogFooter>
            <Button onClick={() => setAlertOpen(false)}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
