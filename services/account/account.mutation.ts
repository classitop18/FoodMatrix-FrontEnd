import { useMutation } from "@tanstack/react-query";
import { AccountService } from "./account.service";
import { CreateAccountPayload } from "./types/account.types";
import { queryClient } from "@/lib/react-query";

const accountService = new AccountService();

export const useCreateAccount = () => {
  return useMutation({
    mutationKey: ["account"],
    mutationFn: (payload: CreateAccountPayload) =>
      accountService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["myaccounts"],
      });

    },
    onError: (error: any) => {
      console.log(error, "Error in Account Creation");
    },
  });
};
