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
// import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, ShoppingCart, Loader2, Sparkles } from "lucide-react";
// import { PublicHeader } from "@/components/PublicHeader";
import StepIndicator from "@/components/setup/StepIndicator";
import Step1ProfileBudget from "@/components/setup/Step1ProfileBudget";
import Step2HealthActivity from "@/components/setup/Step2HealthActivity";
import Step3DietaryPreferences from "@/components/setup/Step3DietaryPreferences";
import Step4LifestyleHabits from "@/components/setup/Step4LifestyleHabits";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import Image from "next/image";

const setupSchema = z.object({
    // Account & Personal Info (Only name and budget are required)
    accountType: z.enum(['individual', 'family', 'group']).default('family'),
    accountName: z.string().optional(),
    adminName: z.string().min(1, "Name is required"),
    adminAge: z.coerce.number().min(13).max(120).default(25),
    adminSex: z.enum(['male', 'female', 'other']).default('male'),

    // Budget Periods (Only weekly is required)
    dailyBudget: z.coerce.number().optional(),
    weeklyBudget: z.coerce.number().min(10, "Minimum weekly budget is $10").default(300),
    monthlyBudget: z.coerce.number().optional(),
    annualBudget: z.coerce.number().optional(),
    currentAllocation: z.enum(['daily', 'weekly', 'monthly', 'annual']).default('weekly'),

    // Food Category Percentages (User Configurable)
    groceriesPercentage: z.coerce.number().min(0).max(100).default(70),
    diningPercentage: z.coerce.number().min(0).max(100).default(20),
    emergencyPercentage: z.coerce.number().min(0).max(100).default(10),

    // All other fields are optional
    height: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    activityLevel: z.enum(['sedentary', 'moderate', 'active', 'very_active']).optional(),
    conditions: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
    dietaryRestrictions: z.array(z.string()).default([]),
    organicPreference: z.enum(['standard_only', 'prefer_when_budget_allows', 'organic_only']).default('standard_only'),
    goals: z.array(z.string()).default([]),
    targetWeight: z.coerce.number().optional(),
    cookingSkill: z.enum(['beginner', 'moderate', 'advanced']).optional(),
    cookingFrequency: z.enum(['mostly_home', 'mixed', 'mostly_dining_out']).optional(),
    preferredCuisines: z.array(z.string()).default([]),
    budgetFlexibility: z.enum(['strict', 'moderate', 'flexible']).optional(),
    hasDeepFreezer: z.boolean().default(false),
    shopsDaily: z.boolean().default(false),
});

type SetupData = z.infer<typeof setupSchema>;

export default function SetupPage() {
    // const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [accountType, setAccountType] = useState<'individual' | 'family' | 'group'>('family');
    const [isPreparing, setIsPreparing] = useState(false);

    // Check if user already has an account
    const { data: currentUser } = useQuery({
        queryKey: ['/api/auth/me'],
        retry: false,
    });
    // const queryClient = useQueryClient();

    // Redirect to dashboard if account already exists
    useEffect(() => {
        if (currentUser && (currentUser as any).account) {
            toast({
                title: "Account Found",
                description: "Welcome back! Redirecting to your dashboard.",
            });
            // setLocation("/dashboard");
        }
    }, [currentUser, toast]);

    const form = useForm<SetupData>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            accountType: 'family',
            weeklyBudget: 300,
            currentAllocation: 'weekly' as const,
            groceriesPercentage: 70,
            diningPercentage: 20,
            emergencyPercentage: 10,
            conditions: [],
            allergies: [],
            dietaryRestrictions: [],
            goals: [],
            preferredCuisines: [],
            organicPreference: 'standard_only' as const,
            hasDeepFreezer: false,
            shopsDaily: false,
        },
    });

    // Watch budget values and percentages
    const weeklyBudget = form.watch('weeklyBudget') || 0;
    const dailyBudget = form.watch('dailyBudget') || 0;
    const monthlyBudget = form.watch('monthlyBudget') || 0;
    const annualBudget = form.watch('annualBudget') || 0;
    const currentAllocation = form.watch('currentAllocation');

    const groceriesPercentage = Number(form.watch('groceriesPercentage'));
    const diningPercentage = Number(form.watch('diningPercentage'));
    const emergencyPercentage = Number(form.watch('emergencyPercentage'));

    // Calculate current budget based on selected allocation
    const currentBudget = currentAllocation === 'daily' ? dailyBudget :
        currentAllocation === 'weekly' ? weeklyBudget :
            currentAllocation === 'monthly' ? monthlyBudget :
                currentAllocation === 'annual' ? annualBudget : weeklyBudget;

    // Calculate category budgets based on user percentages
    const groceriesBudget = (currentBudget * groceriesPercentage) / 100;
    const diningBudget = (currentBudget * diningPercentage) / 100;
    const emergencyBudget = (currentBudget * emergencyPercentage) / 100;

    // Validation: Check if percentages add up to 100% (allow small rounding tolerance)
    const totalPercentage = Number(groceriesPercentage) + Number(diningPercentage) + Number(emergencyPercentage);
    const isPercentageValid = Math.abs(totalPercentage - 100) <= 1;
    const correctedIsPercentageValid = Math.abs(totalPercentage - 100) <= 2;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type') as 'individual' | 'family' | 'group';
        if (type) {
            setAccountType(type);
            form.setValue('accountType', type);
        }
    }, [form]);

    const setupMutation = useMutation({
        mutationFn: async (data: SetupData) => {
            const accountData = {
                type: data.accountType,
                name: data.accountName,
                dailyBudget: data.dailyBudget?.toString(),
                weeklyBudget: data.weeklyBudget?.toString() || '300',
                monthlyBudget: data.monthlyBudget?.toString(),
                annualBudget: data.annualBudget?.toString(),
                currentAllocation: data.currentAllocation,
                groceriesPercentage: data.groceriesPercentage,
                diningPercentage: data.diningPercentage,
                emergencyPercentage: data.emergencyPercentage,
                adminName: data.adminName,
                adminAge: data.adminAge,
                adminSex: data.adminSex,
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
            const destination = data.accountType === "individual" ? "/meal-planning" : "/dashboard";
            // setLocation(destination);
        },
        onError: (error: any) => {
            toast({
                title: "Setup failed",
                description: error.message || "Something went wrong during account creation",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: SetupData) => {
        if (!correctedIsPercentageValid) {
            toast({
                title: "Invalid Budget Allocation",
                description: `Budget percentages must total 100%. Current total: ${totalPercentage}%`,
                variant: "destructive",
            });
            return;
        }

        if (Math.abs(totalPercentage - 100) > 1) {
            toast({
                title: "Budget Allocation Notice",
                description: `Percentages total ${totalPercentage}% (close to 100%). Proceeding with account creation.`,
                variant: "default",
            });
        }

        setupMutation.mutate(data);
    };

    function validateStep(step: number): boolean {
        const values = form.getValues();
        const errors: Record<string, string> = {};

        if (step === 1) {
            if (!values?.adminName) errors.adminName = "Full name is required";
            if (!values?.adminAge || values.adminAge < 5 || values?.adminAge > 130) errors.adminAge = "Valid age is required";
            if (!values.weeklyBudget || values.weeklyBudget < 10) errors.weeklyBudget = "Weekly budget must be at least $10";
            const totalPercent = Number(values.groceriesPercentage || 0) + Number(values.diningPercentage || 0) + Number(values.emergencyPercentage || 0);
            if (Math.abs(totalPercent - 100) > 1) errors.percentages = "Percentages must total 100%";
        }

        if (step === 2) {
            if (!values.activityLevel) errors.activityLevel = "Activity level is required";
        }

        if (step === 3) {
            if (!values.organicPreference) errors.organicPreference = "Organic preference is required";
        }

        if (step === 4) {
            if (!values.cookingSkill) errors.cookingSkill = "Cooking skill is required";
            if (!values.cookingFrequency) errors.cookingFrequency = "Cooking frequency is required";
            if (!values.budgetFlexibility) errors.budgetFlexibility = "Budget flexibility is required";
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
        // else setLocation("/");
    };

    const handleArrayToggle = (field: keyof SetupData, value: string) => {
        const current = form.getValues(field) as string[] || [];
        if (current.includes(value)) {
            form.setValue(field, current.filter(item => item !== value) as any);
        } else {
            form.setValue(field, [...current, value] as any);
        }
    };

    const stepTitles = [
        "Profile & Budget",
        "Health & Activity",
        "Dietary Preferences",
        "Lifestyle & Habits"
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
                    transition={{ duration: 6, delay: 2, repeat: Infinity, ease: "easeInOut" }}
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
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--primary)] mb-1">
                                    Account Setup
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Let's personalize your FoodMatrix experience
                                </p>
                            </div>


                        </div>
                    </div>

                </motion.div>




                <motion.div
                    className="bg-white/80 backdrop-blur-xl border-2 border-[#7661d3]/20 shadow-2xl rounded-3xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* Step Indicator */}
                    <div className="bg-gradient-to-r from-[#F3F0FD] to-[#E8F5E0] px-8 py-6 border-b-2 border-[#7661d3]/20">
                        <StepIndicator currentStep={currentStep} totalSteps={4} stepTitles={stepTitles} />
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
                                <h2 className="text-2xl font-bold mb-2 text-[#3d326d]">Preparing your dashboard</h2>
                                <p className="text-gray-600">
                                    Please wait while we personalize your experience...
                                </p>
                            </motion.div>
                        </div>
                    )}

                    {/* Form Content */}
                    <form onSubmit={form.handleSubmit((data: SetupData) => onSubmit(data))} className="p-8">
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
                                <Step4LifestyleHabits
                                    key="step4"
                                    form={form}
                                />
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
                                {currentStep === 1 ? "Back to Welcome" : "Previous"}
                            </Button>

                            {isLastStep ? (
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#7661d3] to-[#7dab4f] hover:from-[#3d326d] hover:to-[#9bc76d] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                    disabled={setupMutation.isPending || !correctedIsPercentageValid}
                                    data-testid="button-create-account"
                                >
                                    {setupMutation.isPending ? "Creating Account..." : "Create Account"}
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