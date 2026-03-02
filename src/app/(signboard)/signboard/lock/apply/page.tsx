"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Step1Form from "@/features/lock/lockApplication/components/Step1Form";
import ApplicationReview from "@/features/lock/lockApplication/components/ApplicationReview";
import { useCreateLockApplication } from "@/features/lock/lockApplication/query";
import type { LockApplicationStep1 } from "@/lib/schemas/lock-application";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Step = "step1" | "review";

export default function LockApplyPage() {
  const router = useRouter();
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
      // Redirect to query page
      router.push(`/signboard/lock/query/${step1Data.applicantNo}`);
    } catch (error) {
      toast.error("申请提交失败，请重试");
    }
  };

  const handlePrev = () => {
    if (currentStep === "review") {
      setCurrentStep("step1");
    }
  };

  const handleBack = () => {
    router.push("/signboard/lock");
  };

  // Step indicator for mobile
  const getStepNumber = () => {
    if (currentStep === "step1") return 1;
    return 2;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={currentStep === "step1" ? handleBack : handlePrev}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold ml-2">锁具申请</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step <= getStepNumber()
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
            {step < 2 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  step < getStepNumber() ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center mb-6 text-sm text-gray-600">
        <span className={currentStep === "step1" ? "text-blue-500 font-medium" : ""}>申请人信息</span>
        <span className="mx-2">→</span>
        <span className={currentStep === "review" ? "text-blue-500 font-medium" : ""}>确认提交</span>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-lg p-4 shadow">
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
    </div>
  );
}
