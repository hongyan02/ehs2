"use client";

import { useState } from "react";
import { toast } from "sonner";
import Step1Form from "./components/Step1Form";
import ApplicationReview from "./components/ApplicationReview";
import { useCreateLockApplication } from "./query";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";

type Step = "step1" | "review";

export default function LockApplicationPage() {
  const [currentStep, setCurrentStep] = useState<Step>("step1");
  const [step1Data, setStep1Data] = useState<LockApplicationStep1 | null>(null);

  const createMutation = useCreateLockApplication();

  const handleStep1Next = (data: LockApplicationStep1) => {
    setStep1Data(data);
    setCurrentStep("review");
  };

  const handleSubmit = async () => {
    if (!step1Data) return;

    try {
      await createMutation.mutateAsync(step1Data);
      toast.success("申请提交成功");
      // Reset form or redirect
      setCurrentStep("step1");
      setStep1Data(null);
    } catch (error) {
      toast.error("申请提交失败，请重试");
    }
  };

  const handlePrev = () => {
    if (currentStep === "review") {
      setCurrentStep("step1");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">锁具申请</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        <div className="flex-1 flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep !== "step1" ? "bg-green-500" : "bg-blue-500"
            } text-white`}
          >
            1
          </div>
          <span className="ml-2">申请人信息</span>
        </div>
        <div className="w-16 h-1 bg-gray-200">
          <div
            className={`h-full ${
              currentStep === "review"
                ? "bg-blue-500"
                : "bg-gray-200"
            }`}
          />
        </div>
        <div className="flex-1 flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === "review" ? "bg-blue-500" : "bg-gray-300"
            } text-white`}
          >
            2
          </div>
          <span className="ml-2">确认提交</span>
        </div>
      </div>

      {/* Form Steps */}
      {currentStep === "step1" && (
        <Step1Form
          onNext={handleStep1Next}
          defaultValues={step1Data || undefined}
        />
      )}

      {currentStep === "review" && step1Data && (
        <ApplicationReview
          step1Data={step1Data}
          onSubmit={handleSubmit}
          onPrev={handlePrev}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
