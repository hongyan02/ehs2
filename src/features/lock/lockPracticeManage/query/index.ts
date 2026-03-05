import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPracticeEligible, submitPracticeResult, getPracticeCompleted, PracticeEligibleParams, PracticeResultData, PracticeCompletedParams } from "./api";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Practice eligible applications query
export const usePracticeEligible = (params: PracticeEligibleParams) => {
  return useQuery<PaginatedResponse<any>>({
    queryKey: ["practiceEligible", params],
    queryFn: async () => {
      const res = await getPracticeEligible(params);
      return res.data.data;
    },
  });
};

// Submit practice result mutation
export const useSubmitPracticeResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PracticeResultData) => submitPracticeResult(data),
    onSuccess: () => {
      // Invalidate and refetch practice eligible list
      queryClient.invalidateQueries({ queryKey: ["practiceEligible"] });
    },
  });
};

// Practice completed applications query
export const usePracticeCompleted = (params: PracticeCompletedParams) => {
  return useQuery<PaginatedResponse<any>>({
    queryKey: ["practiceCompleted", params],
    queryFn: async () => {
      const res = await getPracticeCompleted(params);
      return res.data.data;
    },
  });
};
