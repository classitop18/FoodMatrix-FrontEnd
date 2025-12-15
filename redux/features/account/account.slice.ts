import { createSlice, PayloadAction } from "@reduxjs/toolkit";



export interface AccountState {
    activeAccount: any,
    accounts: any[],
    loading: boolean,
    error: any,
}

