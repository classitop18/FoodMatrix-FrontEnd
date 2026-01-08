import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HealProfileService } from "./health-profile.service";
import { useToast } from "@/hooks/use-toast";

const healthProfileService = new HealProfileService();

export const useCreateHealthProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      healthProfileService.createHealthProfile(memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["account", variables.memberId],
      });
      toast({
        variant: "success",
        title: "Health Profile Created",
        description: "Health profile created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description:
          error?.response?.data?.message ||
          "Failed to create health profile. Please try again.",
      });
    },
  });
};

export const useUpdateHealthProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      healthProfileService.updateHealthProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["health-profile", variables.id],
      });
      toast({
        variant: "success",
        title: "Health Profile Updated!",
        description: "Your health profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          "Failed to update health profile. Please try again.",
      });
    },
  });
};
