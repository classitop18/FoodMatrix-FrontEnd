import { useQuery } from "@tanstack/react-query";
import { GetMembersParams, MemberService } from "./member.service";

const memberSerice = new MemberService();

export const useMembers = (params: GetMembersParams) => {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => memberSerice.getMembers(params),
    enabled: !!params.accountId,
  });
};
