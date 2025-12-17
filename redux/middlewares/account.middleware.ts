import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { fetchAccountDetail, setActiveAccountId } from "../features/account/account.slice";


// Listener middleware
export const accountListener = createListenerMiddleware();

accountListener.startListening({
    actionCreator: setActiveAccountId, // jab bhi ye action fire ho
    effect: async (action, listenerApi) => {
        const accountId = action.payload;
        if (accountId) {
            listenerApi.dispatch(fetchAccountDetail(accountId));
        }
    },
});
