"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useLocation } from "wouter";
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

type SetupData = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<
    "individual" | "family" | "group"
  >("family");
  const [isPreparing, setIsPreparing] = useState(false);

  const router = useRouter();

  const form = useForm<SetupData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      accountType: "family",
      weeklyBudget: 300,
      currentAllocation: "weekly" as const,
      groceriesPercentage: 70,
      diningPercentage: 20,
      emergencyPercentage: 10,
      conditions: [],
      allergies: [],
      dietaryRestrictions: [],
      goals: [],
      preferredCuisines: [],
      organicPreference: "standard_only" as const,
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
      ? dailyBudget
      : currentAllocation === "weekly"
        ? weeklyBudget
        : currentAllocation === "monthly"
          ? monthlyBudget
          : currentAllocation === "annual"
            ? annualBudget
            : weeklyBudget;

  // Calculate category budgets based on user percentages
  const groceriesBudget = (currentBudget * groceriesPercentage) / 100;
  const diningBudget = (currentBudget * diningPercentage) / 100;
  const emergencyBudget = (currentBudget * emergencyPercentage) / 100;

  // Validation: Check if percentages add up to 100% (allow small rounding tolerance)
  const totalPercentage =
    Number(groceriesPercentage) +
    Number(diningPercentage) +
    Number(emergencyPercentage);
  const isPercentageValid = Math.abs(totalPercentage - 100) <= 1;
  const correctedIsPercentageValid = Math.abs(totalPercentage - 100) <= 2;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as "individual" | "family" | "group";
    if (type) {
      setAccountType(type);
      form.setValue("accountType", type);
    }
  }, [form]);

  const createAccountMutation = useCreateAccount();

  const setupMutation = useMutation({
    mutationFn: async (data: SetupData) => {
      const accountData = {
        type: data.accountType,
        accountName: data.accountName,
        dailyBudget: data.dailyBudget?.toString(),
        weeklyBudget: data.weeklyBudget?.toString() || "300",
        monthlyBudget: data.monthlyBudget?.toString(),
        annualBudget: data.annualBudget?.toString(),
        currentAllocation: data.currentAllocation,
        groceriesPercentage: data.groceriesPercentage,
        diningPercentage: data.diningPercentage,
        emergencyPercentage: data.emergencyPercentage,
        healthProfile: {
          height: data.height,
          weight: data.weight,
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

      // const response = await apiRequest("POST", "/api/accounts", accountData);

      // if (!response.ok) {
      //     const errorData = await response.text();
      //     throw new Error(`Account creation failed: ${errorData}`);
      // }

      // const result = await response.json();
      // return result;
    },
    onSuccess: async (data) => {
      setIsPreparing(true);
      const keys = [
        "/api/auth/me",
        "/api/dashboard",
        "/api/budget-summary",
        "/api/checkout-history",
      ];

      // await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setIsPreparing(false);
      const destination =
        data.accountType === "individual" ? "/meal-planning" : "/dashboard";
      // setLocation(destination);
    },

    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description:
          error.message || "Something went wrong during account creation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SetupData) => {
    try {
      // ❌ Hard validation
      if (!correctedIsPercentageValid) {
        toast({
          title: "Budget Allocation Error",
          description: `Your budget distribution must total exactly 100%. 
Currently it is ${totalPercentage}%. Please adjust and try again.`,
          variant: "destructive",
        });
        return;
      }

      // ⚠️ Soft warning (allowed)
      if (Math.abs(totalPercentage - 100) > 1) {
        toast({
          title: "Budget Allocation Warning",
          description: `Your budget totals ${totalPercentage}%. 
We'll proceed, but consider adjusting it closer to 100% for better accuracy.`,
        });
      }

      const accountData = {
        type: data.accountType,
        accountName: data.accountName,
        dailyBudget: data.dailyBudget?.toString(),
        weeklyBudget: data.weeklyBudget?.toString() || "300",
        monthlyBudget: data.monthlyBudget?.toString(),
        annualBudget: data.annualBudget?.toString(),
        currentAllocation: data.currentAllocation,
        groceriesPercentage: data.groceriesPercentage,
        diningPercentage: data.diningPercentage,
        emergencyPercentage: data.emergencyPercentage,
        healthProfile: {
          height: data.height,
          weight: data.weight,
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

      toast({
        title: "Creating Account...",
        description: "Please wait while we set up your account and preferences.",
      });

      await createAccountMutation.mutateAsync(accountData);

      toast({
        title: "Account Created Successfuly",
        description: "Redirecting......",
      });

      router.push("/dashboard")



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
      if (!values.weeklyBudget || values.weeklyBudget < 10)
        errors.weeklyBudget = "Weekly budget must be at least $10";
      const totalPercent =
        Number(values.groceriesPercentage || 0) +
        Number(values.diningPercentage || 0) +
        Number(values.emergencyPercentage || 0);
      if (Math.abs(totalPercent - 100) > 1)
        errors.percentages = "Percentages must total 100%";
    }

    if (step === 2) {
      if (!values.activityLevel)
        errors.activityLevel = "Activity level is required";
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F3F0FD] via-white to-[#E8F5E0]">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={pattern1}
          className="absolute -top-64 -left-32 opacity-30"
          width={818}
          height={818}
          alt="Pattern-1"
        />
        <Image
          src={pattern2}
          className="absolute -bottom-64 -right-32 opacity-30"
          width={818}
          height={818}
          alt="Pattern-2"
        />

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#7661d3]/20 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#7dab4f]/20 rounded-full blur-3xl"
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
      <main className="relative z-10  mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="mb-6 animate-slide-up">
            <div className="flex flex-col  items-start  justify-between ">
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
          className=" rounded-2xl sm:rounded-3xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Step Indicator */}
          <div className=" px-5 py-3 border-b-2 border-[#7661d3]/20">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={4}
              stepTitles={stepTitles}
            />
          </div>

          {/* Preparing Dashboard Overlay */}
          {isPreparing && (
            <div className="fixed inset-0 bg-gradient-to-br from-[#7661d3]/20 to-[#7dab4f]/20 backdrop-blur-md flex items-center justify-center z-50">
              <motion.div
                className="p-8 bg-white rounded-3xl shadow-2xl text-center max-w-md border-2 border-[#7661d3]/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-[#7661d3]" />
                <h2 className="text-2xl font-bold mb-2 text-[#3d326d]">
                  Preparing your dashboard
                </h2>
                <p className="text-gray-600">
                  Please wait while we personalize your experience...
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
                <Step1ProfileBudget
                  key="step1"
                  form={form}
                  accountType={accountType}
                  currentAllocation={currentAllocation}
                  groceriesPercentage={groceriesPercentage}
                  diningPercentage={diningPercentage}
                  emergencyPercentage={emergencyPercentage}
                  groceriesBudget={groceriesBudget}
                  diningBudget={diningBudget}
                  emergencyBudget={emergencyBudget}
                  totalPercentage={totalPercentage}
                  isPercentageValid={isPercentageValid}
                />
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t-2 border-[#7661d3]/20">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="w-full sm:w-auto h-12 px-8 rounded-xl border-2 border-[#7661d3]/30 hover:bg-[#F3F0FD] hover:border-[#7661d3] transition-all duration-300 font-semibold"
                data-testid="button-previous"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                {currentStep === 1 ? "Back to Account" : "Previous"}
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] hover:from-[#3d326d] hover:to-[#7661d3] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={
                    createAccountMutation.isPending || !correctedIsPercentageValid
                  }
                  data-testid="button-create-account"
                >
                  {createAccountMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                  <ShoppingCart className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#3d326d] hover:from-[#3d326d] hover:to-[#7661d3] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next Step
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
