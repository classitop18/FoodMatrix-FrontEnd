import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HealProfileService } from "./health-profile.service";

const healthProfileService = new HealProfileService();

export const useGetHealthProfile = (id: string) => {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => healthProfileService.getMemberHealthProfile(id),
    enabled: !!id, // only run query if id exists
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateHealthProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      healthProfileService.createHealthProfile(memberId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch health profile query
      queryClient.invalidateQueries({
        queryKey: ["account", variables.memberId],
      });
    },
  });
};

export const useUpdateHealthProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      healthProfileService.updateHealthProfile(memberId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch health profile query
      queryClient.invalidateQueries({
        queryKey: ["account", variables.memberId],
      });
    },
  });
};
