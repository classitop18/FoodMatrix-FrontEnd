import { useQuery } from "@tanstack/react-query";
import { MemberService } from "./member.service";
import { GetMembersParams } from "./types/member.types";

const memberService = new MemberService();

export const useMembers = (params: GetMembersParams, options?: any) => {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => memberService.getMembers(params),
    enabled: !!params.accountId,
    ...options,
  });
};

export const useGetMember = (memberId: string) => {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: () => memberService.getMemberById(memberId),
    enabled: !!memberId,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
