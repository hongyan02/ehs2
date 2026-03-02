import { useQuery, useMutation } from "@tanstack/react-query";
import { getExamConfig, getExamResult, submitExamResult, uploadImage, type ExamConfig, type ExamResult } from "./api";

export const useExamConfig = () => {
  return useQuery({
    queryKey: ["lockExamConfig"],
    queryFn: async () => {
      const res = await getExamConfig();
      return res.data.data ?? null;
    },
    throwOnError: false,
  });
};

export const useExamResult = (applicationId: number) => {
  return useQuery({
    queryKey: ["examResult", applicationId],
    queryFn: async () => {
      const res = await getExamResult(applicationId);
      return res.data.data ?? null;
    },
    enabled: !!applicationId,
    throwOnError: false,
  });
};

export const useSubmitExamResult = () => {
  return useMutation({
    mutationFn: submitExamResult,
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};

export type { ExamConfig, ExamResult };
