"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Heart,
  Shield,
  Star,
  Check,
  Activity,
  Target,
  Utensils,
  DollarSign,
  Lock,
  Save,
  Edit2,
  X,
  Plus,
  Trash2,
  ChefHat,
  ShoppingCart,
  Leaf,
  AlertCircle,
  TrendingUp,
  Calendar,
  Scale,
  Ruler,
  Zap,
} from "lucide-react";
import Loader from "@/components/common/Loader";
import {
  useGetHealthProfile,
  useCreateHealthProfile,
  useUpdateHealthProfile,
} from "@/services/health-profile/health-profile.query";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import { toast } from "sonner";

export default function HealthProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("physical");

  // Form state
  const [formData, setFormData] = useState<any>({
    height: "",
    weight: "",
    activityLevel: "",
    conditions: [],
    allergies: [],
    dietaryRestrictions: [],
    organicPreference: "standard_only",
    goals: [],
    targetWeight: "",
    cookingSkill: "",
    cookingFrequency: "",
    preferredCuisines: [],
    budgetFlexibility: "",
    excludedFoods: [],
    includedFoods: [],
    customExclusions: [],
    customInclusions: [],
    preferenceSets: [],
    autoLearn: true,
    autoSwap: true,
    hasDeepFreezer: false,
    shopsDaily: false,
    privacyLevel: "private",
    dailySodiumLimitMg: 2300,
    dailyCarbLimitG: "",
    dailyCalorieTarget: "",
    dailyFiberTargetG: 25,
  });

  const { data: memberHealth, isLoading: isHealthProfileFetching } =
    useGetHealthProfile(memberId!);

  const createMutation = useCreateHealthProfile();
  const updateMutation = useUpdateHealthProfile();

  const healthProfileExists = !!memberHealth?.data;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Update form data when API data is loaded OR enable edit mode if no profile exists
  useEffect(() => {
    if (memberHealth?.data) {
      const data = memberHealth.data;
      setFormData({
        height: data.height ?? "",
        weight: data.weight ?? "",
        activityLevel: data.activityLevel ?? "",
        conditions: data.conditions ?? [],
        allergies: data.allergies ?? [],
        dietaryRestrictions: data.dietaryRestrictions ?? [],
        organicPreference: data.organicPreference ?? "standard_only",
        goals: data.goals ?? [],
        targetWeight: data.targetWeight ?? "",
        cookingSkill: data.cookingSkill ?? "",
        cookingFrequency: data.cookingFrequency ?? "",
        preferredCuisines: data.preferredCuisines ?? [],
        budgetFlexibility: data.budgetFlexibility ?? "",
        excludedFoods: data.excludedFoods ?? [],
        includedFoods: data.includedFoods ?? [],
        customExclusions: data.customExclusions ?? [],
        customInclusions: data.customInclusions ?? [],
        preferenceSets: data.preferenceSets ?? [],
        autoLearn: data.autoLearn ?? true,
        autoSwap: data.autoSwap ?? true,
        hasDeepFreezer: data.hasDeepFreezer ?? false,
        shopsDaily: data.shopsDaily ?? false,
        privacyLevel: data.privacyLevel ?? "private",
        dailySodiumLimitMg: data.dailySodiumLimitMg ?? 2300,
        dailyCarbLimitG: data.dailyCarbLimitG ?? "",
        dailyCalorieTarget: data.dailyCalorieTarget ?? "",
        dailyFiberTargetG: data.dailyFiberTargetG ?? 25,
      });
      setIsEditing(false); // Disable edit mode if profile exists
    } else if (memberHealth && !memberHealth.data) {
      // No health profile found - enable edit mode automatically
      setIsEditing(true);
    }
  }, [memberHealth]);

  const handleSave = async () => {
    try {
      // Transform form data to match backend schema
      const transformedData = {
        ...formData,
        // Convert string numbers to actual numbers, or omit if empty
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
        dailySodiumLimitMg: formData.dailySodiumLimitMg ? Number(formData.dailySodiumLimitMg) : undefined,
        dailyCarbLimitG: formData.dailyCarbLimitG ? Number(formData.dailyCarbLimitG) : undefined,
        dailyCalorieTarget: formData.dailyCalorieTarget ? Number(formData.dailyCalorieTarget) : undefined,
        dailyFiberTargetG: formData.dailyFiberTargetG ? Number(formData.dailyFiberTargetG) : undefined,
        // Remove empty strings for enum fields
        activityLevel: formData.activityLevel || undefined,
        cookingSkill: formData.cookingSkill || undefined,
        cookingFrequency: formData.cookingFrequency || undefined,
        budgetFlexibility: formData.budgetFlexibility || undefined,
        organicPreference: formData.organicPreference || undefined,
        privacyLevel: formData.privacyLevel || undefined,
      };

      if (healthProfileExists) {
        // Update existing health profile
        await updateMutation.mutateAsync({
          memberId: memberId!,
          data: transformedData,
        });
        toast.success("Health profile updated successfully!");
      } else {
        // Create new health profile
        await createMutation.mutateAsync({
          memberId: memberId!,
          data: transformedData,
        });
        toast.success("Health profile created successfully!");
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving health profile:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to save health profile. Please try again.",
      );
    }
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i: string) => i !== item)
        : [...prev[field], item],
    }));
  };

  const addCustomItem = (field: string, value: string) => {
    if (value.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeCustomItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  if (isHealthProfileFetching) {
    return <Loader />;
  }

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = (formData.height * 2.54) / 100;
      const weightInKg = formData.weight * 0.453592;
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden w-full font-sans">
      {/* Background Patterns */}
      <Image
        src={pattern1}
        className="absolute -top-64 -left-32 opacity-30 pointer-events-none"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-48 opacity-30 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:bg-purple-100 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                Health Profile
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {healthProfileExists
                  ? "Manage health information and dietary preferences"
                  : "Create your health profile to get personalized recommendations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                {healthProfileExists && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white hover:bg-gray-50 text-[#313131] font-bold py-2.5 px-4 rounded-xl shadow-sm border border-gray-100 transition-all flex items-center gap-2 text-sm"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#7661d3] hover:bg-[#6952c2] text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {healthProfileExists ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {healthProfileExists ? "Save Changes" : "Create Profile"}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#7661d3] hover:bg-[#6952c2] text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Info Banner for New Profile */}
        {!healthProfileExists && (
          <div className="bg-gradient-to-r from-[#7661d3] to-[#8B7DD8] rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">
                  Welcome! Let's Create Your Health Profile
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Fill out the information below to help us provide personalized meal recommendations,
                  track your nutrition goals, and tailor recipes to your dietary needs and preferences.
                  You can always update this information later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Health Score & BMI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* BMI Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F3F0FD] rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wide">
                  BMI
                </span>
                <Scale className="w-5 h-5 text-[#7661d3]" />
              </div>
              <h3 className="text-3xl font-extrabold text-[#313131]">
                {bmi || "—"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {bmi
                  ? parseFloat(bmi) < 18.5
                    ? "Underweight"
                    : parseFloat(bmi) < 25
                      ? "Normal"
                      : parseFloat(bmi) < 30
                        ? "Overweight"
                        : "Obese"
                  : "Not calculated"}
              </p>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-[#3d326d] rounded-xl p-5 shadow-md text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-105 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 font-bold text-xs uppercase tracking-wide">
                  Health Score
                </span>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-white">
                {memberHealth?.data?.healthScore ?? 50}/100
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Overall wellness rating
              </p>
            </div>
          </div>

          {/* Activity Level Card */}
          <div className="bg-gradient-to-br from-[#7dab4f] to-[#6a9642] rounded-xl p-5 shadow-md text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-105 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/90 font-bold text-xs uppercase tracking-wide">
                  Activity
                </span>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white capitalize">
                {formData.activityLevel?.replace(/_/g, " ") || "Not set"}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Current activity level
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] px-6 pt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: "physical", label: "Physical Info", icon: Activity },
                { id: "health", label: "Health Conditions", icon: Heart },
                { id: "dietary", label: "Dietary Preferences", icon: Utensils },
                { id: "goals", label: "Goals & Targets", icon: Target },
                { id: "lifestyle", label: "Lifestyle", icon: ChefHat },
                { id: "preferences", label: "Food Preferences", icon: Leaf },
                { id: "settings", label: "Settings", icon: Lock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-white text-[#7661d3] shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Physical Information Tab */}
            {activeTab === "physical" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Physical Measurements
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Height */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Ruler size={16} className="text-[#7661d3]" />
                      Height (inches)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 68"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Scale size={16} className="text-[#7661d3]" />
                      Weight (pounds)
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 150"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  {/* Activity Level */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Zap size={16} className="text-[#7661d3]" />
                      Activity Level
                    </label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activityLevel: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">
                        Sedentary (little/no exercise)
                      </option>
                      <option value="moderate">Moderate (1-3 days/week)</option>
                      <option value="active">Active (3-5 days/week)</option>
                      <option value="very_active">
                        Very Active (6-7 days/week)
                      </option>
                    </select>
                  </div>
                </div>

                {bmi && (
                  <div className="bg-[#F8F7FC] rounded-xl p-5 border-l-4 border-[#7661d3]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#7661d3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-[#7661d3]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#313131] mb-1">
                          BMI Analysis
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your BMI is{" "}
                          <span className="font-bold text-[#7661d3]">
                            {bmi}
                          </span>
                          , which is considered{" "}
                          <span className="font-bold">
                            {parseFloat(bmi) < 18.5
                              ? "underweight"
                              : parseFloat(bmi) < 25
                                ? "normal weight"
                                : parseFloat(bmi) < 30
                                  ? "overweight"
                                  : "obese"}
                          </span>
                          .{" "}
                          {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25
                            ? "Keep up the great work!"
                            : "Consider consulting with a healthcare professional for personalized advice."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Health Conditions Tab */}
            {activeTab === "health" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Health & Medical Information
                  </span>
                </div>

                {/* Health Conditions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#7661d3]" />
                    Health Conditions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      "type1_diabetes",
                      "type2_diabetes",
                      "prediabetes",
                      "hypertension",
                      "high_cholesterol",
                      "heart_disease",
                      "ibs",
                      "gerd",
                      "celiac_disease",
                      "obesity",
                      "pcos",
                      "kidney_disease",
                      "gout",
                    ].map((condition) => (
                      <div
                        key={condition}
                        onClick={() =>
                          isEditing && toggleArrayItem("conditions", condition)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.conditions.includes(condition)
                          ? "bg-[#7661d3]/10 border-[#7661d3]"
                          : "bg-gray-50 border-transparent hover:border-gray-200"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.conditions.includes(condition)
                            ? "bg-[#7661d3] border-[#7661d3]"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {formData.conditions.includes(condition) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <label className="text-sm font-medium cursor-pointer capitalize">
                          {condition.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Food Allergies
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "nuts",
                      "dairy",
                      "gluten",
                      "shellfish",
                      "soy",
                      "eggs",
                    ].map((allergy) => (
                      <div
                        key={allergy}
                        onClick={() =>
                          isEditing && toggleArrayItem("allergies", allergy)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.allergies.includes(allergy)
                          ? "bg-red-50 border-red-500"
                          : "bg-gray-50 border-transparent hover:border-gray-200"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.allergies.includes(allergy)
                            ? "bg-red-500 border-red-500"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {formData.allergies.includes(allergy) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <label className="text-sm font-medium cursor-pointer capitalize">
                          {allergy}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Preferences Tab */}
            {activeTab === "dietary" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Utensils className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Dietary Restrictions & Preferences
                  </span>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Dietary Restrictions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "vegan",
                      "vegetarian",
                      "keto",
                      "paleo",
                      "mediterranean",
                      "low_carb",
                      "dash",
                      "halal",
                      "kosher",
                    ].map((diet) => (
                      <div
                        key={diet}
                        onClick={() =>
                          isEditing &&
                          toggleArrayItem("dietaryRestrictions", diet)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.dietaryRestrictions.includes(diet)
                          ? "bg-[#7dab4f]/10 border-[#7dab4f]"
                          : "bg-gray-50 border-transparent hover:border-gray-200"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.dietaryRestrictions.includes(diet)
                            ? "bg-[#7dab4f] border-[#7dab4f]"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {formData.dietaryRestrictions.includes(diet) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <label className="text-sm font-medium cursor-pointer capitalize">
                          {diet.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organic Preference */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-[#7dab4f]" />
                    Organic Food Preference
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        value: "standard_only",
                        title: "Only Standard Food",
                        desc: "Choose conventional food options only",
                      },
                      {
                        value: "prefer_when_budget_allows",
                        title: "Prefer Organic Foods",
                        desc: "When budget allows, prioritize organic options",
                      },
                      {
                        value: "organic_only",
                        title: "Organic Food Only",
                        desc: "Purchase only certified organic food products",
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() =>
                          isEditing &&
                          setFormData({
                            ...formData,
                            organicPreference: option.value,
                          })
                        }
                        className={`flex items-center gap-3 border-2 p-4 rounded-xl transition-all ${formData.organicPreference === option.value
                          ? "border-[#7661d3] bg-[#7661d3]/5"
                          : "border-gray-200 hover:border-gray-300"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.organicPreference === option.value
                            ? "border-[#7661d3]"
                            : "border-gray-300"
                            }`}
                        >
                          {formData.organicPreference === option.value && (
                            <div className="w-3 h-3 rounded-full bg-[#7661d3]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">
                            {option.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {option.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Goals & Targets Tab */}
            {activeTab === "goals" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Health Goals & Targets
                  </span>
                </div>

                {/* Health Goals */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Health Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      "lose_weight",
                      "maintain_weight",
                      "gain_weight",
                      "build_muscle",
                      "control_blood_sugar",
                      "lower_cholesterol",
                      "reduce_sodium",
                      "general_wellness",
                      "healthy_family_eating",
                    ].map((goal) => (
                      <div
                        key={goal}
                        onClick={() =>
                          isEditing && toggleArrayItem("goals", goal)
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${formData.goals.includes(goal)
                          ? "bg-[#7661d3]/10 border-[#7661d3]"
                          : "bg-gray-50 border-transparent hover:border-gray-200"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${formData.goals.includes(goal)
                            ? "bg-[#7661d3] border-[#7661d3]"
                            : "border-gray-300 bg-white"
                            }`}
                        >
                          {formData.goals.includes(goal) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <label className="text-sm font-medium cursor-pointer capitalize leading-tight">
                          {goal.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Weight & Daily Targets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Target Weight (pounds)
                    </label>
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetWeight: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 145"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Daily Calorie Target
                    </label>
                    <input
                      type="number"
                      value={formData.dailyCalorieTarget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyCalorieTarget: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 2000"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Daily Sodium Limit (mg)
                    </label>
                    <input
                      type="number"
                      value={formData.dailySodiumLimitMg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailySodiumLimitMg: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 2300"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Daily Carb Limit (g)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyCarbLimitG}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyCarbLimitG: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 300"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Daily Fiber Target (g)
                    </label>
                    <input
                      type="number"
                      value={formData.dailyFiberTargetG}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyFiberTargetG: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="e.g., 25"
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === "lifestyle" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <ChefHat className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Cooking & Shopping Habits
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cooking Skill */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cooking Skill Level
                    </label>
                    <select
                      value={formData.cookingSkill}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cookingSkill: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select skill level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Cooking Frequency */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Cooking Frequency
                    </label>
                    <select
                      value={formData.cookingFrequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cookingFrequency: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select frequency</option>
                      <option value="rarely">Rarely (1-2 times/week)</option>
                      <option value="sometimes">
                        Sometimes (3-4 times/week)
                      </option>
                      <option value="often">Often (5-6 times/week)</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>

                  {/* Budget Flexibility */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Budget Flexibility
                    </label>
                    <select
                      value={formData.budgetFlexibility}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetFlexibility: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select budget flexibility</option>
                      <option value="strict">
                        Strict (Must stay within budget)
                      </option>
                      <option value="moderate">
                        Moderate (Some flexibility)
                      </option>
                      <option value="flexible">
                        Flexible (Quality over price)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Shopping & Storage Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#7661d3]" />
                    Shopping & Storage
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() =>
                        isEditing &&
                        setFormData({
                          ...formData,
                          hasDeepFreezer: !formData.hasDeepFreezer,
                        })
                      }
                      className={`flex items-center justify-between border-2 p-4 rounded-xl transition-all ${isEditing
                        ? "cursor-pointer hover:border-[#7661d3]"
                        : "cursor-default"
                        } ${formData.hasDeepFreezer ? "border-[#7661d3] bg-[#7661d3]/5" : "border-gray-200"}`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Deep Freezer Available
                        </div>
                        <p className="text-sm text-gray-600">
                          Can store bulk frozen items
                        </p>
                      </div>
                      <div
                        className={`w-12 h-7 rounded-full relative transition-colors ${formData.hasDeepFreezer
                          ? "bg-[#7dab4f]"
                          : "bg-gray-200"
                          }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${formData.hasDeepFreezer ? "left-6" : "left-1"
                            }`}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        isEditing &&
                        setFormData({
                          ...formData,
                          shopsDaily: !formData.shopsDaily,
                        })
                      }
                      className={`flex items-center justify-between border-2 p-4 rounded-xl transition-all ${isEditing
                        ? "cursor-pointer hover:border-[#7661d3]"
                        : "cursor-default"
                        } ${formData.shopsDaily ? "border-[#7661d3] bg-[#7661d3]/5" : "border-gray-200"}`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Daily Shopping
                        </div>
                        <p className="text-sm text-gray-600">
                          Prefer fresh daily purchases
                        </p>
                      </div>
                      <div
                        className={`w-12 h-7 rounded-full relative transition-colors ${formData.shopsDaily ? "bg-[#7dab4f]" : "bg-gray-200"
                          }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${formData.shopsDaily ? "left-6" : "left-1"
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Food Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Leaf className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Food Preferences & Exclusions
                  </span>
                </div>

                {/* Smart Learning Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Smart Learning Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() =>
                        isEditing &&
                        setFormData({
                          ...formData,
                          autoLearn: !formData.autoLearn,
                        })
                      }
                      className={`flex items-center justify-between border-2 p-4 rounded-xl transition-all ${isEditing
                        ? "cursor-pointer hover:border-[#7661d3]"
                        : "cursor-default"
                        } ${formData.autoLearn ? "border-[#7661d3] bg-[#7661d3]/5" : "border-gray-200"}`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Auto-Learn Preferences
                        </div>
                        <p className="text-sm text-gray-600">
                          Learn from meal feedback
                        </p>
                      </div>
                      <div
                        className={`w-12 h-7 rounded-full relative transition-colors ${formData.autoLearn ? "bg-[#7dab4f]" : "bg-gray-200"
                          }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${formData.autoLearn ? "left-6" : "left-1"
                            }`}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        isEditing &&
                        setFormData({
                          ...formData,
                          autoSwap: !formData.autoSwap,
                        })
                      }
                      className={`flex items-center justify-between border-2 p-4 rounded-xl transition-all ${isEditing
                        ? "cursor-pointer hover:border-[#7661d3]"
                        : "cursor-default"
                        } ${formData.autoSwap ? "border-[#7661d3] bg-[#7661d3]/5" : "border-gray-200"}`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          Auto-Swap Ingredients
                        </div>
                        <p className="text-sm text-gray-600">
                          Replace excluded items automatically
                        </p>
                      </div>
                      <div
                        className={`w-12 h-7 rounded-full relative transition-colors ${formData.autoSwap ? "bg-[#7dab4f]" : "bg-gray-200"
                          }`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${formData.autoSwap ? "left-6" : "left-1"
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Exclusions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Custom Food Exclusions
                    </h3>
                    {isEditing && (
                      <button
                        onClick={() => {
                          const value = prompt("Enter food to exclude:");
                          if (value) addCustomItem("customExclusions", value);
                        }}
                        className="text-sm font-bold text-[#7661d3] hover:bg-[#7661d3]/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.customExclusions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No custom exclusions added
                      </p>
                    ) : (
                      formData.customExclusions.map(
                        (item: string, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200"
                          >
                            <span className="text-sm font-medium">{item}</span>
                            {isEditing && (
                              <button
                                onClick={() =>
                                  removeCustomItem("customExclusions", index)
                                }
                                className="hover:bg-red-200 rounded p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>

                {/* Custom Inclusions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Custom Food Inclusions
                    </h3>
                    {isEditing && (
                      <button
                        onClick={() => {
                          const value = prompt("Enter food to include:");
                          if (value) addCustomItem("customInclusions", value);
                        }}
                        className="text-sm font-bold text-[#7661d3] hover:bg-[#7661d3]/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.customInclusions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No custom inclusions added
                      </p>
                    ) : (
                      formData.customInclusions.map(
                        (item: string, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200"
                          >
                            <span className="text-sm font-medium">{item}</span>
                            {isEditing && (
                              <button
                                onClick={() =>
                                  removeCustomItem("customInclusions", index)
                                }
                                className="hover:bg-green-200 rounded p-0.5 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 bg-[#7661d3]/10 text-[#7661d3] px-4 py-2 rounded-full">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    Privacy & Advanced Settings
                  </span>
                </div>

                {/* Privacy Level */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Health Data Visibility
                  </h3>
                  <select
                    value={formData.privacyLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, privacyLevel: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#7661d3] rounded-xl focus:outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="private">Private (only me)</option>
                    <option value="admin_only">Admin Only</option>
                    <option value="shared">Shared with all members</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Control who can view your health profile information
                  </p>
                </div>

                {/* Profile Stats */}
                <div className="bg-[#F8F7FC] rounded-xl p-6 border-l-4 border-[#7661d3]">
                  <h4 className="font-bold text-[#313131] mb-4">
                    Profile Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Health Score
                      </p>
                      <p className="text-2xl font-extrabold text-[#7661d3]">
                        {memberHealth?.data?.healthScore ?? 50}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        BMI
                      </p>
                      <p className="text-2xl font-extrabold text-[#313131]">
                        {bmi ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {memberHealth?.data?.updatedAt
                          ? new Date(
                            memberHealth.data.updatedAt,
                          ).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Privacy Level
                      </p>
                      <p className="text-sm font-bold text-gray-700 capitalize">
                        {formData.privacyLevel.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
