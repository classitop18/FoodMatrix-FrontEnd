import { useQuery } from "@tanstack/react-query";
import { GetMembersParams, MemberService } from "./member.service";

const memberSerice = new MemberService();

export const useMembers = (params: GetMembersParams, options?: any) => {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => memberSerice.getMembers(params),
    enabled: !!params.accountId,
    ...options,
  });
};

export const useGetMember = (memberId: string) => {
  return useQuery({
    queryKey: ["member", memberId],
    queryFn: () => memberSerice.getMemberById(memberId),
    enabled: !!memberId,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
