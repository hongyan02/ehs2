"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ClipboardList, Loader2, FileText } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_CONFIG_LOCAL || "/api";

interface ExamConfig {
  practiceFileUrl?: string;
}

export default function PracticeExamPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = parseInt(params.applicationId as string);

  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // 获取考试配置（包含实操考核文件 URL）
  useEffect(() => {
    const fetchExamConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE}/lock/exam-config`);
        if (response.data.success && response.data.data) {
          setExamConfig(response.data.data);
        }
      } catch (error) {
        console.error("获取考试配置失败:", error);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchExamConfig();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    if (examConfig?.practiceFileUrl) {
      window.open(examConfig.practiceFileUrl, "_blank");
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setMessage(null);

    try {
      // 调用申请实操考核 API
      const response = await axios.post(`${API_BASE}/lock/exam/practice/${applicationId}`);

      if (response.data.success) {
        setMessage({ type: "success", text: "申请已提交，请等待实操考核" });
        // 3秒后返回上一页
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        setMessage({ type: "error", text: response.data.message || "提交失败" });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "提交失败，请重试",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-2">实操考核</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Download Section */}
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-4">实操考核资料</h2>
          {isLoadingConfig ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">加载中...</span>
            </div>
          ) : examConfig?.practiceFileUrl ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium">实操考核文件</p>
                  <p className="text-sm text-gray-500">点击下载实操考核相关资料</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-center">暂无可下载的实操考核资料</p>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-4">申请实操考核</h2>
          <p className="text-sm text-gray-600 mb-4">
            点击下方按钮申请实操考核，提交后将通知相关人员进行实操考核。
          </p>

          {message && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <ClipboardList className="w-4 h-4 mr-2" />
                申请实操考核
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
