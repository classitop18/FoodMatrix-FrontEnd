"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { ArrowLeft, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import StepIndicator from "@/components/setup/StepIndicator";
import Step1ProfileBudget from "@/components/setup/Step1ProfileBudget";
import Step2HealthActivity from "@/components/setup/Step2HealthActivity";
import Step3DietaryPreferences from "@/components/setup/Step3DietaryPreferences";
import Step4LifestyleHabits from "@/components/setup/Step4LifestyleHabits";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import Image from "next/image";
import { setupSchema } from "@/schema/account/account.schema";
import { useCreateAccount } from "@/services/account/account.mutation";
import { useRouter } from "next/navigation";
import { AddressAutocomplete } from "@/components/profile/address-autocomplete";

type SetupData = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<
    "individual" | "family" | "group"
  >("family");
  const [isPreparing, setIsPreparing] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      accountType: "family",
      accountName: "",
      description: "",
      weeklyBudget: 300,
      currentAllocation: "weekly",
      groceriesPercentage: 70,
      diningPercentage: 20,
      emergencyPercentage: 10,
      sex: undefined,
      conditions: [],
      allergies: [],
      dietaryRestrictions: [],
      goals: [],
      preferredCuisines: [],
      organicPreference: "standard_only",
      hasDeepFreezer: false,
      shopsDaily: false,
    },
  });

  // Watch budget values and percentages
  const weeklyBudget = form.watch("weeklyBudget") || 0;
  const dailyBudget = form.watch("dailyBudget") || 0;
  const monthlyBudget = form.watch("monthlyBudget") || 0;
  const annualBudget = form.watch("annualBudget") || 0;
  const currentAllocation = form.watch("currentAllocation");

  const groceriesPercentage = Number(form.watch("groceriesPercentage"));
  const diningPercentage = Number(form.watch("diningPercentage"));
  const emergencyPercentage = Number(form.watch("emergencyPercentage"));

  // Calculate current budget based on selected allocation
  const currentBudget =
    currentAllocation === "daily"
      ? dailyBudget || 0
      : currentAllocation === "weekly"
        ? weeklyBudget || 0
        : currentAllocation === "monthly"
          ? monthlyBudget || 0
          : currentAllocation === "annual"
            ? annualBudget || 0
            : weeklyBudget || 0;

  // Calculate category budgets based on user percentages
  const groceriesBudget =
    ((currentBudget as number) * groceriesPercentage) / 100;
  const diningBudget = ((currentBudget as number) * diningPercentage) / 100;
  const emergencyBudget =
    ((currentBudget as number) * emergencyPercentage) / 100;

  // Validation: Check if percentages add up to 100% (allow small rounding tolerance)
  const totalPercentage =
    Number(groceriesPercentage) +
    Number(diningPercentage) +
    Number(emergencyPercentage);
  const isPercentageValid = Math.abs(totalPercentage - 100) <= 1;
  const correctedIsPercentageValid = Math.abs(totalPercentage - 100) <= 2;

  const STORAGE_KEY = "foodmatrix_account_setup_state";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as "individual" | "family" | "group";
    if (type) {
      setAccountType(type);
      form.setValue("accountType", type);
    }
  }, [form]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step) setCurrentStep(parsed.step);
        if (parsed.data) {
          // Merge saved data with default values to ensure all fields exist
          const mergedData = { ...form.getValues(), ...parsed.data };
          form.reset(mergedData);
        }
      } catch (e) {
        console.error("Failed to load setup state", e);
      }
    }
    setIsInitialized(true);
  }, []); // Run once on mount

  // Save state on change
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((value) => {
      const stateToSave = {
        step: currentStep,
        data: value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    });

    // Also save current step when it changes
    const currentState = localStorage.getItem(STORAGE_KEY);
    const parsedState = currentState ? JSON.parse(currentState) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...parsedState,
      step: currentStep,
      // Ensure data is preserved if form hasn't changed yet
      data: parsedState.data || form.getValues()
    }));

    return () => subscription.unsubscribe();
  }, [form, currentStep, isInitialized]);

  const createAccountMutation = useCreateAccount();

  const onSubmit = async (data: SetupData) => {
    try {
      if (!correctedIsPercentageValid) {
        toast({
          title: "Budget Allocation Error",
          description: `Your budget distribution must total exactly 100%. 
Currently it is ${totalPercentage}%. Please adjust and try again.`,
          variant: "destructive",
        });
        return;
      }

      if (Math.abs(totalPercentage - 100) > 1) {
        toast({
          title: "Budget Allocation Warning",
          description: `Your budget totals ${totalPercentage}%. 
We'll proceed, but consider adjusting it closer to 100% for better accuracy.`,
        });
      }

      let calculatedDaily = "0";
      let calculatedWeekly = "0";
      let calculatedMonthly = "0";
      let calculatedAnnual = "0";

      const alloc = data.currentAllocation || "weekly";

      if (alloc === "annual" && data.annualBudget) {
        const annual = Number(data.annualBudget);
        calculatedAnnual = annual.toString();
        calculatedMonthly = (annual / 12).toFixed(2);
        calculatedWeekly = (annual / 52).toFixed(2);
        calculatedDaily = (annual / 365).toFixed(2);
      } else if (alloc === "monthly" && data.monthlyBudget) {
        const monthly = Number(data.monthlyBudget);
        calculatedMonthly = monthly.toString();
        calculatedAnnual = (monthly * 12).toFixed(2);
        calculatedWeekly = ((monthly * 12) / 52).toFixed(2);
        calculatedDaily = ((monthly * 12) / 365).toFixed(2);
      } else if (alloc === "weekly" && data.weeklyBudget) {
        const weekly = Number(data.weeklyBudget);
        calculatedWeekly = weekly.toString();
        calculatedAnnual = (weekly * 52).toFixed(2);
        calculatedMonthly = ((weekly * 52) / 12).toFixed(2);
        calculatedDaily = (weekly / 7).toFixed(2);
      } else if (alloc === "daily" && data.dailyBudget) {
        const daily = Number(data.dailyBudget);
        calculatedDaily = daily.toString();
        calculatedWeekly = (daily * 7).toFixed(2);
        calculatedMonthly = (daily * 30.44).toFixed(2); // Avg days in month
        calculatedAnnual = (daily * 365).toFixed(2);
      } else {
        // Fallback default if nothing valid is provided
        calculatedWeekly = "300";
        calculatedMonthly = ((300 * 52) / 12).toFixed(2);
        calculatedAnnual = (300 * 52).toFixed(2);
        calculatedDaily = (300 / 7).toFixed(2);
      }

      const accountData = {
        accountType: "family",
        accountName: data.accountName,
        description: data?.description,
        dailyBudget: calculatedDaily,
        weeklyBudget: calculatedWeekly,
        monthlyBudget: calculatedMonthly,
        annualBudget: calculatedAnnual,
        currentAllocation: data.currentAllocation,
        groceriesPercentage: data.groceriesPercentage,
        diningPercentage: data.diningPercentage,
        emergencyPercentage: data.emergencyPercentage,
        // Add address data if available
        ...(addressData && {
          addressLine1: addressData.addressLine1,
          addressLine2: addressData.addressLine2,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          zipCode: addressData.zipCode,
          formattedAddress: addressData.formattedAddress,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          placeId: addressData.placeId,
        }),
        healthProfile: {
          height: data.height,
          weight: data.weight,
          sex: data.sex,
          activityLevel: data.activityLevel,
          conditions: data.conditions,
          allergies: data.allergies,
          dietaryRestrictions: data.dietaryRestrictions,
          organicPreference: data.organicPreference,
          goals: data.goals,
          targetWeight: data.targetWeight,
          cookingSkill: data.cookingSkill,
          cookingFrequency: data.cookingFrequency,
          preferredCuisines: data.preferredCuisines,
          budgetFlexibility: data.budgetFlexibility,
          hasDeepFreezer: data.hasDeepFreezer,
          shopsDaily: data.shopsDaily,
          isPrivate: false,
          healthScore: 50,
        },
      };

      await createAccountMutation.mutateAsync(accountData);

      // Clear saved state on success
      localStorage.removeItem(STORAGE_KEY);

      setIsPreparing(true);

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "We couldn't create your account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  function validateStep(step: number): boolean {
    const values = form.getValues();
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!values.accountName || values.accountName.trim().length < 2) {
        errors.accountName = "Account name is required (min 2 characters)";
      }

      const allocation = values.currentAllocation || "weekly";
      let budgetVal = 0;
      let minBudget = 0;
      let budgetField = "weeklyBudget";

      switch (allocation) {
        case "daily":
          budgetVal = Number(values.dailyBudget);
          minBudget = 5;
          budgetField = "dailyBudget";
          break;
        case "weekly":
          budgetVal = Number(values.weeklyBudget);
          minBudget = 10;
          budgetField = "weeklyBudget";
          break;
        case "monthly":
          budgetVal = Number(values.monthlyBudget);
          minBudget = 50;
          budgetField = "monthlyBudget";
          break;
        case "annual":
          budgetVal = Number(values.annualBudget);
          minBudget = 500;
          budgetField = "annualBudget";
          break;
        default:
          budgetVal = Number(values.weeklyBudget);
          minBudget = 10;
          budgetField = "weeklyBudget";
      }

      if (!budgetVal || budgetVal < minBudget) {
        errors[budgetField] = `${allocation.charAt(0).toUpperCase() + allocation.slice(1)
          } budget must be at least $${minBudget}`;
      } else if (budgetVal > 10000000) {
        errors[budgetField] = `${allocation.charAt(0).toUpperCase() + allocation.slice(1)
          } budget must be less than $10,000,000`;
      }

      const totalPercent =
        Number(values.groceriesPercentage || 0) +
        Number(values.diningPercentage || 0) +
        Number(values.emergencyPercentage || 0);
      if (Math.abs(totalPercent - 100) > 1)
        errors.percentages = "Percentages must total 100%";
    }

    if (step === 2) {
      if (
        !values.height ||
        Number(values.height) < 24 ||
        Number(values.height) > 120
      )
        errors.height = "Height must be between 24 and 120 inches";

      if (
        !values.weight ||
        Number(values.weight) < 50 ||
        Number(values.weight) > 1000
      )
        errors.weight = "Weight must be between 50 and 1000 lbs";

      if (!values.activityLevel)
        errors.activityLevel = "Activity level is required";

      if (!values.sex)
        errors.sex = "Sex is required";
    }

    if (step === 3) {
      if (!values.organicPreference)
        errors.organicPreference = "Organic preference is required";
    }

    if (step === 4) {
      if (!values.cookingSkill)
        errors.cookingSkill = "Cooking skill is required";
      if (!values.cookingFrequency)
        errors.cookingFrequency = "Cooking frequency is required";
      if (!values.budgetFlexibility)
        errors.budgetFlexibility = "Budget flexibility is required";
    }

    if (Object.keys(errors).length > 0) {
      for (const key in errors) {
        form.setError(key as any, { type: "manual", message: errors[key] });
      }

      toast({
        title: "Missing Information",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });

      return false;
    }

    return true;
  }

  const handleNext = (e: any) => {
    if (validateStep(currentStep)) {
      e.preventDefault();
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e: any) => {
    e.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.push("/account");
  };

  const handleArrayToggle = (field: keyof SetupData, value: string) => {
    const current = (form.getValues(field) as string[]) || [];
    if (current.includes(value)) {
      form.setValue(field, current.filter((item) => item !== value) as any);
    } else {
      form.setValue(field, [...current, value] as any);
    }
  };

  const stepTitles = [
    "Profile & Budget",
    "Health & Activity",
    "Dietary Preferences",
    "Lifestyle & Habits",
  ];

  const isLastStep = currentStep === 4;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-100">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs - Using CSS variables for theme colors */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[var(--green)]/20 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 6,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="animate-slide-up">
            <div className="flex flex-col items-start justify-between">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--primary)] mb-1">
                Account Setup
              </h1>
              <p className="text-sm text-gray-600">
                Let's personalize your FoodMatrix experience
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl overflow-hidden bg-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Step Indicator */}
          <div className="px-5 py-8 border-b border-[var(--primary)]/10">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={4}
              stepTitles={stepTitles}
            />
          </div>

          {/* Creating Account / Preparing Dashboard Overlay */}
          {(createAccountMutation.isPending || isPreparing) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[50000]">
              <motion.div
                className="p-8 bg-white rounded-3xl shadow-2xl text-center max-w-md border-2 border-[var(--primary)]/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-[var(--primary)]" />
                <h2 className="text-2xl font-bold mb-2 text-[var(--primary)]">
                  {createAccountMutation.isPending
                    ? "Creating your account"
                    : "Preparing your dashboard"}
                </h2>
                <p className="text-gray-600">
                  {createAccountMutation.isPending
                    ? "Please wait while we set up your account and preferences..."
                    : "Success! Redirecting you to your dashboard..."}
                </p>
              </motion.div>
            </div>
          )}

          {/* Form Content */}
          <form
            onSubmit={form.handleSubmit((data: SetupData) => onSubmit(data))}
            className="p-8"
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <>
                  <Step1ProfileBudget
                    key="step1"
                    form={form}
                    accountType={accountType}
                    currentAllocation={currentAllocation || "weekly"}
                    groceriesPercentage={groceriesPercentage}
                    diningPercentage={diningPercentage}
                    emergencyPercentage={emergencyPercentage}
                    groceriesBudget={groceriesBudget}
                    diningBudget={diningBudget}
                    emergencyBudget={emergencyBudget}
                    totalPercentage={totalPercentage}
                    isPercentageValid={isPercentageValid}
                  />

                  {/* Address Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="border-t-2 border-[var(--primary)]/10 pt-6">
                      <h3 className="text-lg font-bold text-[var(--primary)] mb-4">
                        Account Address (Optional)
                      </h3>
                      <AddressAutocomplete
                        onAddressSelect={(address) => {
                          setAddressData(address);
                        }}
                        label="Primary Address"
                        placeholder="Start typing your address..."
                        className="mb-3"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This will be used for delivery and location-based
                        recommendations
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
              {currentStep === 2 && (
                <Step2HealthActivity
                  key="step2"
                  form={form}
                  handleArrayToggle={handleArrayToggle}
                />
              )}
              {currentStep === 3 && (
                <Step3DietaryPreferences
                  key="step3"
                  form={form}
                  handleArrayToggle={handleArrayToggle}
                />
              )}
              {currentStep === 4 && (
                <Step4LifestyleHabits key="step4" form={form} />
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t-2 border-[var(--primary)]/10">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="w-full sm:w-auto h-12 px-8 rounded-xl border-2 border-[var(--primary)]/30 hover:bg-[#F3F0FD] hover:border-[var(--primary)] transition-all duration-300 font-semibold"
                data-testid="button-previous"
              >
                <ArrowLeft className=" h-5 w-5" />
                {currentStep === 1 ? "Back to Account" : "Previous"}
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:from-[var(--primary-light)] hover:to-[var(--primary)] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={
                    createAccountMutation.isPending ||
                    !correctedIsPercentageValid
                  }
                  data-testid="button-create-account"
                >
                  {createAccountMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                  <ShoppingCart className=" w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:from-[var(--primary-light)] hover:to-[var(--primary)] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next Step
                  <ArrowRight className=" w-5 h-5" />
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
