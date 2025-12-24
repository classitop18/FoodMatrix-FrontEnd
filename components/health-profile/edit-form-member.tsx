"use client";
import React, { useState } from "react";
import { ArrowLeft, User, Heart, Shield, Star, Check } from "lucide-react";

export default function ProfileEditPage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Basic Info State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Health Profile State
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [organicPreference, setOrganicPreference] = useState(
    "prefer_when_budget_allows",
  );
  const [goals, setGoals] = useState<string[]>([]);
  const [privacyLevel, setPrivacyLevel] = useState("private");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      console.log("Saved successfully");
      setIsSaving(false);
    }, 1500);
  };

  const toggleArrayItem = (
    array: string[],
    setArray: Function,
    item: string,
  ) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute -top-64 -left-32 w-[818px] h-[818px] opacity-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-3xl"></div>
      </div>
      <div className="absolute -bottom-64 -right-32 w-[818px] h-[818px] opacity-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-tl from-purple-200 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              className="hover:bg-purple-100 p-2 rounded-lg transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Edit Profile
              </h1>
              <p className="text-sm text-gray-600">
                Update your personal and health information
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="bg-gradient-to-r from-[#705CC7] to-[#8B7DD8] px-8 pt-8">
            <div className="w-full grid grid-cols-2 bg-white/20 backdrop-blur-sm p-1.5 rounded-xl border-2 border-white/30">
              <button
                onClick={() => setActiveTab("basic")}
                className={`text-sm font-bold rounded-lg transition-all duration-200 py-3 ${
                  activeTab === "basic"
                    ? "bg-white text-[#705CC7]"
                    : "text-white hover:bg-white/30"
                }`}
              >
                <User className="w-4 h-4 mr-2 inline" />
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab("health")}
                className={`text-sm font-bold rounded-lg transition-all duration-200 py-3 ${
                  activeTab === "health"
                    ? "bg-white text-[#705CC7]"
                    : "text-white hover:bg-white/30"
                }`}
              >
                <Heart className="w-4 h-4 mr-2 inline" />
                Health Profile
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#705CC7]/10 text-[#705CC7] px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">
                    Personal Information
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#705CC7] rounded-xl focus:outline-none"
                  />
                </div>

                {/* Age & Sex */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="34"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#705CC7] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      Sex
                    </label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value)}
                      className="w-full h-12 px-4 text-base border-2 border-gray-200 focus:border-[#705CC7] rounded-xl focus:outline-none bg-white"
                    >
                      <option value="">Select your sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Admin Access */}
                <div className="flex justify-between items-center border-2 border-gray-200 rounded-xl p-4 hover:border-[#705CC7] transition-colors">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      Admin Access
                    </div>
                    <p className="text-sm text-gray-600">
                      Can manage account settings & members
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isAdmin
                        ? "bg-[#705CC7] border-[#705CC7]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isAdmin && <Check className="w-3 h-3 text-white" />}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "health" && (
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-[#705CC7]/10 text-[#705CC7] px-4 py-2 rounded-full">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">Health & Wellness</span>
                </div>

                {/* Physical Stats */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#705CC7]/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#705CC7]" />
                    </div>
                    Physical Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">
                        Height (inches)
                      </label>
                      <input
                        type="number"
                        placeholder="68"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">
                        Weight (pounds)
                      </label>
                      <input
                        type="number"
                        placeholder="150"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="h-11 rounded-lg border border-[#BCBCBC] text-black bg-white focus:ring-0 transition-all text-base font-medium shadow-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Activity Level
                    </label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-[#705CC7] rounded-xl focus:outline-none bg-white"
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

                {/* Health Conditions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#705CC7]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#705CC7]" />
                    </div>
                    Health Conditions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-purple-50 transition-colors border-2 border-transparent hover:border-purple-200 cursor-pointer"
                        onClick={() =>
                          toggleArrayItem(conditions, setConditions, condition)
                        }
                      >
                        <button
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            conditions.includes(condition)
                              ? "bg-[#705CC7] border-[#705CC7]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {conditions.includes(condition) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <label className="text-sm font-medium cursor-pointer leading-tight">
                          {condition
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
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
                        className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-purple-50 transition-colors border-2 border-transparent hover:border-purple-200 cursor-pointer"
                        onClick={() =>
                          toggleArrayItem(allergies, setAllergies, allergy)
                        }
                      >
                        <button
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            allergies.includes(allergy)
                              ? "bg-[#705CC7] border-[#705CC7]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {allergies.includes(allergy) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <label className="text-sm font-medium cursor-pointer capitalize leading-tight">
                          {allergy}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
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
                        className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-purple-50 transition-colors border-2 border-transparent hover:border-purple-200 cursor-pointer"
                        onClick={() =>
                          toggleArrayItem(
                            dietaryRestrictions,
                            setDietaryRestrictions,
                            diet,
                          )
                        }
                      >
                        <button
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            dietaryRestrictions.includes(diet)
                              ? "bg-[#705CC7] border-[#705CC7]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {dietaryRestrictions.includes(diet) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <label className="text-sm font-medium cursor-pointer capitalize leading-tight">
                          {diet.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organic Preference */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    🥬 Organic Food Preference
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
                        className="flex items-center space-x-3 border-2 border-gray-200 p-4 rounded-xl hover:border-[#705CC7] transition-colors cursor-pointer"
                        onClick={() => setOrganicPreference(option.value)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            organicPreference === option.value
                              ? "border-[#705CC7]"
                              : "border-gray-300"
                          }`}
                        >
                          {organicPreference === option.value && (
                            <div className="w-3 h-3 rounded-full bg-[#705CC7]"></div>
                          )}
                        </div>
                        <label className="font-normal cursor-pointer flex-1">
                          <div className="font-semibold text-gray-900">
                            {option.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {option.desc}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Goals */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Health Goals
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-purple-50 transition-colors border-2 border-transparent hover:border-purple-200 cursor-pointer"
                        onClick={() => toggleArrayItem(goals, setGoals, goal)}
                      >
                        <button
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            goals.includes(goal)
                              ? "bg-[#705CC7] border-[#705CC7]"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {goals.includes(goal) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <label className="text-sm font-medium cursor-pointer leading-tight">
                          {goal
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Privacy Settings
                  </h3>
                  <div>
                    <label className="block font-semibold mb-2">
                      Health Data Visibility
                    </label>
                    <select
                      value={privacyLevel}
                      onChange={(e) => setPrivacyLevel(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-[#705CC7] rounded-xl focus:outline-none bg-white"
                    >
                      <option value="private">Private (only me)</option>
                      <option value="admin_only">Admin Only</option>
                      <option value="shared">Shared with all members</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t-2 border-gray-200 bg-gray-50 px-8 py-6 flex justify-end gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 hover:bg-gray-100 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-[#705CC7] hover:bg-[#5d4ba8] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="mt-8 bg-gradient-to-r from-[#705CC7] to-transparent h-1 rounded-full"></div>
      </main>
    </div>
  );
}
