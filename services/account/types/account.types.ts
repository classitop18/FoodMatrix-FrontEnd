
/* ---------------- ACCOUNT CREATE PAYLOAD ---------------- */

import { HealthProfilePayload } from "@/services/health-profile/types/heal-profile.types";

export interface CreateAccountPayload {
    type: string;                // accountType
    accountName?: string;
    dailyBudget?: string;
    weeklyBudget: string;
    monthlyBudget?: string;
    annualBudget?: string;

    currentAllocation?: string;

    groceriesPercentage?: number;
    diningPercentage?: number;
    emergencyPercentage?: number;

    healthProfile?: HealthProfilePayload;
}