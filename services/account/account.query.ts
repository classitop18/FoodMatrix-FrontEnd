import { useQuery } from "@tanstack/react-query"
import { AccountService } from "./account.service"



const accountService = new AccountService();

export const useMyAccounts = () => {
    return useQuery({
        queryKey: ["account"],
        queryFn: () => accountService.getMyAccount(),
        retry: false,
        refetchOnWindowFocus: false,
    })
}




export const useAccount = (id: string) => {
    return useQuery({
        queryKey: ["account", id], // id ko queryKey me include karna important hai
        queryFn: () => accountService.getAccountById(id),
        enabled: !!id, // only run query if id exists
        retry: false,
        refetchOnWindowFocus: false,
    });
};


