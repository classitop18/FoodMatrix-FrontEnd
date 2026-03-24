"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import StepIndicator from "@/components/setup/StepIndicator";
import Step1ProfileBudget from "@/components/setup/Step1ProfileBudget";
import Step2HealthActivity from "@/components/setup/Step2HealthActivity";
import Step3DietaryPreferences from "@/components/setup/Step3DietaryPreferences";
import Step4LifestyleHabits from "@/components/setup/Step4LifestyleHabits";

import { setupSchema } from "@/schema/account/account.schema";
import { useCreateAccount } from "@/services/account/account.mutation";
import { useRouter } from "next/navigation";
import { AddressAutocomplete } from "@/components/profile/address-autocomplete";
import { useUpdateBudgetMutation } from "@/services/budget/budget.mutation";
import { useDispatch } from "react-redux";
import { setActiveAccountId } from "@/redux/features/account/account.slice";

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
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      accountType: "family",
      accountName: "",
      description: "",
      weeklyBudget: 300,
      currentAllocation: "weekly",
      groceriesPercentage: 100,
      diningPercentage: 0,
      emergencyPercentage: 0,
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
  const dailyBudget = form.watch("dailyBudget") || 0;
  const weeklyBudget = form.watch("weeklyBudget") || 0;
  const currentAllocation = form.watch("currentAllocation");

  const groceriesPercentage = Number(form.watch("groceriesPercentage")) || 0;
  const diningPercentage = Number(form.watch("diningPercentage")) || 0;
  const emergencyPercentage = Number(form.watch("emergencyPercentage")) || 0;

  // Calculate current budget based on selected allocation
  const currentBudget =
    currentAllocation === "daily"
      ? dailyBudget || 0
      : currentAllocation === "weekly"
        ? weeklyBudget || 0
        : weeklyBudget || 0;

  // Calculate category budgets based on user percentages
  const groceriesBudget = ((currentBudget as number) * groceriesPercentage) / 100;
  const diningBudget = ((currentBudget as number) * diningPercentage) / 100;
  const emergencyBudget = ((currentBudget as number) * emergencyPercentage) / 100;

  // Validation: Check if percentages add up to 100% (allow small rounding tolerance)
  const totalPercentage = Number(groceriesPercentage) + Number(diningPercentage) + Number(emergencyPercentage);
  const isPercentageValid = Math.abs(totalPercentage - 100) <= 1;
  const correctedIsPercentageValid = Math.abs(totalPercentage - 100) <= 2;



  console.log({ correctedIsPercentageValid })

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
  const updateBudgetMutation = useUpdateBudgetMutation();

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

      let calculatedWeekly = "0";
      let calculatedDaily = "0";

      const alloc = data.currentAllocation || "weekly";

      if (alloc === "daily" && data.dailyBudget) {
        const daily = Number(data.dailyBudget);
        calculatedDaily = daily.toString();
        calculatedWeekly = (daily * 7).toFixed(2);
      } else if (alloc === "weekly" && data.weeklyBudget) {
        const weekly = Number(data.weeklyBudget);
        calculatedWeekly = weekly.toString();
        calculatedDaily = (weekly / 7).toFixed(2);
      } else {
        // Fallback default if nothing valid is provided
        calculatedWeekly = "300";
        calculatedDaily = (300 / 7).toFixed(2);
      }

      const accountData = {
        accountType: "family",
        accountName: data.accountName,
        description: data?.description,
        dailyBudget: calculatedDaily,
        weeklyBudget: calculatedWeekly,
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

      const res = await createAccountMutation.mutateAsync(accountData);

      if (res && res.data && res.data.accountId) {
        // Create initial budget config
        await updateBudgetMutation.mutateAsync({
          accountId: res.data.accountId,
          payload: {
            mode: accountData.currentAllocation as any,
            dailyAmount: accountData.dailyBudget
              ? Number(accountData.dailyBudget)
              : undefined,
            weeklyAmount: accountData.weeklyBudget
              ? Number(accountData.weeklyBudget)
              : undefined,
            overrideCurrentWeek: true,
          }
        });

        // Update Redux
        dispatch(setActiveAccountId(res.data.accountId) as any);
      }

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
        case "weekly":
          budgetVal = Number(values.weeklyBudget);
          minBudget = 10;
          budgetField = "weeklyBudget";
          break;
        case "daily":
          budgetVal = Number(values.dailyBudget);
          minBudget = 1;
          budgetField = "dailyBudget";
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
    <div className="min-h-[calc(100vh-57px)] relative overflow-auto bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00]">
      {/* Clean Abstract Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#7661d3]/5 to-transparent rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#7dab4f]/5 to-transparent rounded-full -ml-20 -mb-20" />
      </div>

      {/* Main Content */}
      <main className="max-w-8xl relative z-10 mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
              Create New Account
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Set up your preferences and budget to personalize your experience
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Step Indicator */}
          <div className="pb-8 mb-4 border-b border-gray-100">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={4}
              stepTitles={stepTitles}
            />
          </div>

          {/* Creating Account / Preparing Dashboard Overlay */}
          {(createAccountMutation.isPending || isPreparing) && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[50000]">
              <motion.div
                className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md border border-gray-200"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#7661d3]" />
                <h2 className="text-xl font-bold mb-2 text-[#313131]">
                  {createAccountMutation.isPending
                    ? "Creating Account..."
                    : "Preparing Dashboard"}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {createAccountMutation.isPending
                    ? "Please wait while we securely set up your configurations."
                    : "Success! Redirecting to your personalized home."}
                </p>
              </motion.div>
            </div>
          )}

          {/* Form Content */}
          <form
            onSubmit={form.handleSubmit((data: SetupData) => onSubmit(data), (errors) => console.log("FORM ERRORS", errors))}
            className="pt-2 pb-4"
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 space-y-4"
                  >
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-extrabold text-[#313131] tracking-tight mb-4">
                        Account Address <span className="text-sm text-gray-400 font-normal">(Optional)</span>
                      </h3>
                      <AddressAutocomplete
                        onAddressSelect={(address) => {
                          setAddressData(address);
                        }}
                        label="Primary Address"
                        placeholder="Start typing your full address..."
                        className="mb-3"
                      />
                      <p className="text-xs text-gray-500 font-medium">
                        Used for delivery estimates and local grocery availability matching.
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white hover:bg-gray-50 text-[#313131] font-bold shadow-sm border border-gray-200 transition-all text-sm"
                data-testid="button-previous"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              {isLastStep ? (
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#313131] hover:bg-black text-white font-bold shadow-lg transition-all text-sm"
                  disabled={
                    createAccountMutation.isPending ||
                    !correctedIsPercentageValid
                  }
                  data-testid="button-create-account"
                >
                  {createAccountMutation.isPending
                    ? "Processing..."
                    : "Complete Setup"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#313131] hover:bg-black text-white font-bold shadow-lg transition-all text-sm"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
