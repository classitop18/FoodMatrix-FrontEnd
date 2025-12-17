"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Account = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string | null;
  description: string | null;
  weeklyBudget: string | null;
  dailyBudget: string | null;
  monthlyBudget: string | null;
  annualBudget: string | null;
  currentAllocation: string;
  groceriesPercentage: number;
  diningPercentage: number;
  emergencyPercentage: number;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  requiresAdminApprovalForOverrides: boolean;
  autoGenerateGroceryLists: boolean;
  createdAt: string;
};

export default function AccountOverviewPage({ account }: { account: Account }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#3d326d]">
          {account.accountName}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Account #{account.accountNumber}</span>
          <Badge variant="outline" className="capitalize">
            {account.accountType ?? "Not set"}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {account.description && (
        <Card>
          <CardContent className="p-4 text-sm text-gray-600">
            {account.description}
          </CardContent>
        </Card>
      )}

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3d326d]">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Info label="Primary Allocation" value={account.currentAllocation} />
          <Info label="Weekly Budget" value={account.weeklyBudget} />
          <Info label="Daily Budget" value={account.dailyBudget} />
          <Info label="Monthly Budget" value={account.monthlyBudget} />
        </CardContent>
      </Card>

      {/* Category Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3d326d]">Category Allocation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <Percentage label="Groceries" value={account.groceriesPercentage} />
          <Percentage label="Dining" value={account.diningPercentage} />
          <Percentage label="Emergency" value={account.emergencyPercentage} />
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3d326d]">Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-1">
          <p>
            {account.city || "—"}, {account.state || "—"}
          </p>
          <p>
            {account.country || "—"} {account.zipCode || ""}
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3d326d]">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Info
            label="Admin Approval Required"
            value={account.requiresAdminApprovalForOverrides ? "Yes" : "No"}
          />
          <Info
            label="Auto Grocery Lists"
            value={account.autoGenerateGroceryLists ? "Enabled" : "Disabled"}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Meta */}
      <div className="text-xs text-gray-400">
        Created on {new Date(account.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

/* Small helpers */

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-[#3d326d]">{value ?? "—"}</p>
    </div>
  );
}

function Percentage({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-xl p-3 bg-white">
      <p className="text-gray-500">{label}</p>
      <p className="text-xl font-bold text-[#3d326d]">{value}%</p>
    </div>
  );
}
