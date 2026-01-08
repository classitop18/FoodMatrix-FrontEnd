import { useQuery } from "@tanstack/react-query";
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


