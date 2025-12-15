import { useMutation } from "@tanstack/react-query"
import { AccountService } from "./account.service"
import { CreateAccountPayload } from "./types/account.types";




const accountService = new AccountService();

export const useCreateAccount = ()=>{

    return useMutation({
        mutationKey:["account"],
        mutationFn:(payload:CreateAccountPayload)=>accountService.create(payload),
        onSuccess:(data)=>{
            console.log(data,"myaccountdaata")
        },
        onError:(error:any)=>{
            console.log(error,"Error in Account Creation");
        }

    })
}