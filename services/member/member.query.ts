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
