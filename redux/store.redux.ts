import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./features/auth/auth.slice";
import { accountSlice } from "./features/account/account.slice";
import { accountListener } from "./middlewares/account.middleware";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    account: accountSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(accountListener.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
