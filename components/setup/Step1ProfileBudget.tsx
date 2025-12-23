"use client";

import { motion } from "framer-motion";
import { UserCog, Wallet, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface Step1Props {
  form: UseFormReturn<any>;
  accountType: "individual" | "family" | "group";
  currentAllocation: string;
  groceriesPercentage: number;
  diningPercentage: number;
  emergencyPercentage: number;
  groceriesBudget: number;
  diningBudget: number;
  emergencyBudget: number;
  totalPercentage: number;
  isPercentageValid: boolean;
}

export default function Step1ProfileBudget({
  form,
  accountType,
  currentAllocation,
  groceriesPercentage,
  diningPercentage,
  emergencyPercentage,
  groceriesBudget,
  diningBudget,
  emergencyBudget,
  totalPercentage,
  isPercentageValid,
}: Step1Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Profile Section */}
      <div className="bg-white border-2 border-[#7661d3]/20 shadow-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#7661d3]/20">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-[#3d326d]">
          <div className="bg-gradient-to-br from-[#7661d3] to-[#3d326d] p-2 sm:p-3 rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-md">
            <UserCog className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl">Your Profile</span>
        </h3>
        <div className="flex flex-col gap-4 w-full">
          {/* Account Name & Type */}
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold text-[#3d326d] mb-1 block">
                Account Name <span className="text-[#7dab4f]">*</span>
              </Label>
              <Input
                placeholder="Enter account name"
                {...form.register("accountName")}
                className="h-10 sm:h-11 border-2 border-[#7661d3]/30 rounded-lg sm:rounded-xl"
              />
              {form.formState.errors.accountName && (
                <p className="text-sm text-red-500 mt-1">
                  {String(form.formState.errors.accountName.message)}
                </p>
              )}
            </div>
            <div className="max-w-[260px] w-full">
              <Label className="font-semibold text-[#3d326d] mb-1 block">
                Account Type <span className="text-[#7dab4f]">*</span>
              </Label>

              <Select
                value={accountType}
                onValueChange={(value) => form.setValue("accountType", value)}
              >
                <SelectTrigger className="h-10 sm:h-11 w-full border-2 border-[#7661d3]/30 rounded-lg sm:rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="font-semibold text-[#3d326d] mb-1 block">
              Description
            </Label>
            <Input
              placeholder="Short description of this account"
              {...form.register("description")}
              className="h-10 sm:h-11 border-2 border-[#7661d3]/30 rounded-lg sm:rounded-xl"
            />
          </div>
        </div>

        {accountType === "group" && (
          <div className="sm:col-span-2">
            <Label
              htmlFor="groupName"
              className="text-[#3d326d] font-semibold mb-2 block text-sm sm:text-base"
            >
              Group Name
            </Label>
            <Input
              id="groupName"
              placeholder="e.g., Beach House, Office Team"
              {...form.register("accountName")}
              data-testid="input-group-name"
              className="h-11 sm:h-12 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-lg sm:rounded-xl text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      {/* Budget Section */}
      <div className="bg-white border-2 border-[#7661d3]/20 shadow-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-[#7dab4f]/20">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-[#3d326d]">
          <div className="bg-gradient-to-br from-[#7dab4f] to-[#9bc76d] p-2 sm:p-3 rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-md">
            <Wallet className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl">Food Budget Setup</span>
        </h3>

        <div className="space-y-4 sm:space-y-6">
          {/* Budget Period Selection */}
          <div>
            <Label className="text-[#3d326d] font-semibold mb-2 block text-sm sm:text-base">
              Primary Budget Period
            </Label>
            <Select
              value={currentAllocation}
              onValueChange={(value) => {
                form.setValue("currentAllocation", value as any);
                // Reset the budget value for the new period so the user is forced to enter it
                // This addresses "prefilled budget value should be reset"
                if (value === "daily") form.setValue("dailyBudget", "");
                if (value === "weekly") form.setValue("weeklyBudget", "");
                if (value === "monthly") form.setValue("monthlyBudget", "");
                if (value === "annual") form.setValue("annualBudget", "");
              }}
            >
              <SelectTrigger
                data-testid="select-budget-period"
                className="h-11 sm:h-12 border-2 border-[#7dab4f]/30 focus:border-[#7dab4f] rounded-lg sm:rounded-xl text-sm sm:text-base"
              >
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Budget</SelectItem>
                <SelectItem value="weekly">Weekly Budget</SelectItem>
                <SelectItem value="monthly">Monthly Budget</SelectItem>
                <SelectItem value="annual">Annual Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Inputs - Only showing the relevant one */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {[
              {
                id: "daily-budget",
                label: "Daily Budget",
                field: "dailyBudget",
                placeholder: "15",
                min: "1",
                step: "1",
                allocation: "daily",
              },
              {
                id: "weekly-budget",
                label: "Weekly Budget",
                field: "weeklyBudget",
                placeholder: "300",
                min: "10",
                step: "10",
                allocation: "weekly",
              },
              {
                id: "monthly-budget",
                label: "Monthly Budget",
                field: "monthlyBudget",
                placeholder: "1200",
                min: "50",
                step: "50",
                allocation: "monthly",
              },
              {
                id: "annual-budget",
                label: "Annual Budget",
                field: "annualBudget",
                placeholder: "15000",
                min: "500",
                step: "100",
                allocation: "annual",
              },
            ]
              .filter((budget) => budget.allocation === currentAllocation)
              .map((budget) => (
                <div key={budget.id}>
                  <Label
                    htmlFor={budget.id}
                    className="text-[#3d326d] font-semibold mb-2 block text-sm"
                  >
                    {budget.label} <span className="text-[#7dab4f]">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#3d326d] font-bold text-sm sm:text-base">
                      $
                    </span>
                    <Input
                      id={budget.id}
                      type="number"
                      className="pl-7 sm:pl-8 h-11 sm:h-12 border-2 border-[#7dab4f]/30 focus:border-[#7dab4f] rounded-lg sm:rounded-xl text-sm sm:text-base"
                      placeholder={budget.placeholder}
                      min={budget.min}
                      step={budget.step}
                      {...form.register(budget.field)}
                      // On change, allow the user to type freely
                      onChange={(e) => {
                        const val = e.target.value;
                        form.setValue(budget.field, val);
                      }}
                      data-testid={`input-${budget.field.toLowerCase().replace(/([A-Z])/g, "-$1")}`}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 ml-1">
                    Enter your target {budget.allocation} spending limit for food
                    and beverages.
                  </p>
                  {form.formState.errors[budget.field] && (
                    <p className="text-sm text-red-500 mt-1">
                      {String(form.formState.errors[budget.field]?.message)}
                    </p>
                  )}
                </div>
              ))}
          </div>

          {/* Category Percentages */}
          <div className="bg-white/80 rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 border-dashed border-[#7661d3]/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <Label className="text-base sm:text-lg font-bold text-[#3d326d]">
                {currentAllocation.charAt(0).toUpperCase() +
                  currentAllocation.slice(1)}{" "}
                Food Budget Allocation
              </Label>
              <span
                className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-center ${isPercentageValid
                  ? "bg-gradient-to-r from-[#7dab4f] to-[#9bc76d] text-white"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  }`}
              >
                Total: {totalPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  id: "groceries",
                  label: "Groceries",
                  field: "groceriesPercentage",
                  value: groceriesPercentage,
                  budget: groceriesBudget,
                  color: "",
                },
                {
                  id: "dining",
                  label: "Dining Out",
                  field: "diningPercentage",
                  value: diningPercentage,
                  budget: diningBudget,
                  color: "",
                },
                {
                  id: "emergency",
                  label: "Emergency",
                  field: "emergencyPercentage",
                  value: emergencyPercentage,
                  budget: emergencyBudget,
                  color: "",
                },
              ].map((category) => (
                <div key={category.id} className="space-y-2">
                  <Label
                    htmlFor={`${category.id}-percentage`}
                    className="text-[#3d326d] font-semibold text-sm"
                  >
                    {category.label} ({category.value}%)
                  </Label>
                  <Input
                    id={`${category.id}-percentage`}
                    type="number"
                    min={0}
                    max={100}
                    step="5"
                    {...form.register(category.field)}
                    data-testid={`input-${category.id}-percentage`}
                    className="h-10 sm:h-11 border-2 border-[#7661d3]/30 focus:border-[#7661d3] rounded-lg text-sm sm:text-base"
                  />
                  <div className="relative">
                    <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-white font-bold text-sm">
                      $
                    </span>
                    <Input
                      value={`$${category.budget.toFixed(0)}`}
                      readOnly
                      data-testid={`text-${category.id}-budget`}
                      className="h-10 sm:h-11 pl-6 sm:pl-8 rounded-lg text-sm sm:text-base font-semibold bg-gray-100 text-[#3d326d]  cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-[#7661d3]/10 to-[#7dab4f]/10 border-2 border-[#7661d3]/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Info className="text-[#7661d3] mt-0.5 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-[#3d326d]">
                  Budget-First Intelligence Engine
                </p>
                <p className="text-gray-600 mt-1">
                  Your budget applies only to food & beverages. Non-food items
                  are tracked separately without budget restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
