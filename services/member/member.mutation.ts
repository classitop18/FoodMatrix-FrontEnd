import { useMutation } from "@tanstack/react-query";
import { MemberService } from "./member.service";

const memberService = new MemberService();
export const useUpdateMember = () => {
  return useMutation({
    mutationFn: (memberId: string, data: any) =>
      memberService.updateMember(memberId, data),
    onSuccess: () => {},
    onError: () => {},
  });
};

export const useDeleteMember = () => {
  return useMutation({
    mutationFn: (memberId: string) => memberService.deleteMember(memberId),
    onSuccess: () => {},
    onError: () => {},
  });
};
