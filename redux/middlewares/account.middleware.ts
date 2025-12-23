import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  fetchAccountDetail,
  setActiveAccountId,
} from "../features/account/account.slice";
import { RootState } from "../store.redux";

// Listener middleware
export const accountListener = createListenerMiddleware();
accountListener.startListening({
  actionCreator: setActiveAccountId,
  effect: async (action, listenerApi) => {
    const newAccountId = action.payload;

    const state = listenerApi.getState() as RootState;
    const currentAccountId = state.account.activeAccountId;

    console.log({ currentAccountId, newAccountId });

    listenerApi.dispatch(fetchAccountDetail(newAccountId));
  },
});
