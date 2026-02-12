import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "./member.service";
import { toast } from "@/hooks/use-toast";

const memberService = new MemberService();

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => memberService.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        variant: "success",
        title: "Member Created",
        description: "Member created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Create member Failed",
        description:
          error?.response?.data?.message ||
          "Failed to create member. Please try again.",
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: any }) =>
      memberService.updateMember(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        variant: "success",
        title: "Member Updated",
        description: "Member updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          "Failed to update member. Please try again.",
      });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => memberService.deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        variant: "success",
        title: "Member Deleted",
        description: "Member deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description:
          error?.response?.data?.message ||
          "Failed to delete this member. Please try again.",
      });
    },
  });
};

export const useUploadMemberAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { memberId: string; file: File; accountId?: string }) =>
      memberService.uploadAvatar(data.memberId, data.file, data.accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
      toast({
        variant: "success",
        title: "Avatar Updated",
        description: "Member avatar updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          "Failed to update avatar. Please try again.",
      });
    },
  });
};
