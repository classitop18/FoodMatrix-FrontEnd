import React, { JSX, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChefHat,
  DollarSign,
  Timer,
  Users,
  Lightbulb,
  UtensilsCrossed,
  Apple,
  BarChart3,
  LayoutList,
  Sparkles,
  ExternalLink,
  ImageIcon,
  Leaf,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  LineChart,
} from "recharts";

export default function RecipeDetailsPage({
  recipe,
  onBack,
}: {
  recipe: any;
  onBack: any;
}) {
  const [viewMode, setViewMode] = useState<"details" | "graph">("details");
  const [nutritionData, setNutritionData] = useState<any[]>([]);

  const getCuisineColor = (cuisine: string) => {
    const map: Record<string, string> = {
      Italian:
        "bg-red-100 text-red-700 dark:bg-red-900/30 border-red-200 dark:border-red-800",
      Mexican:
        "bg-green-100 text-green-700 dark:bg-green-900/30 border-green-200 dark:border-green-800",
      Chinese:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
      Indian:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    };

    return map[cuisine] || "bg-muted text-foreground";
  };

  // useEffect(() => {
  //     const parsedInstructions = Array.isArray(recipe.instructions)
  //         ? recipe.instructions
  //         : JSON.parse(recipe.instructions || "[]");

  //     const parsedIngredients = Array.isArray(recipe.ingredients)
  //         ? recipe.ingredients
  //         : JSON.parse(recipe.ingredients || "[]");

  //     const parsedNutrition = recipe.nutrition
  //         ? recipe.nutrition
  //         : {
  //             calories: recipe.calories,
  //             protein_g: 0,
  //             carbs_g: 0,
  //             fat_g: 0,
  //             fiber_g: 0,
  //             sugar_g: 0,
  //         };

  //     setNutritionData(normalizeNutritionForChart(parsedNutrition));

  //     setLocalData({
  //         instructions: parsedInstructions,
  //         ingredients: parsedIngredients,
  //     });
  // }, [recipe]);

  // Mock data for Graph View (replace with real data)

  /**
   * Normalizes a nutrition object for chart visualization.
   * Converts keys like protein_g → readable labels and adds consistent colors.
   */
  /**
   * Normalizes nutrition data for chart display (includes calories).
   */
  function normalizeNutritionForChart(nutrition: any) {
    if (!nutrition) return [];

    // Handle legacy array case or if data comes as array
    let data = nutrition;
    if (Array.isArray(nutrition)) {
      if (nutrition.length > 0 && typeof nutrition[0] === "object") {
        data = nutrition[0];
      } else {
        // If empty array or invalid content, return empty to avoid 0s
        return [];
      }
    }

    const mapping = {
      calories: { name: "Calories", color: "#F97316", unit: "kcal" }, // orange
      protein_g: { name: "Protein", color: "#3B82F6", unit: "g" }, // blue
      carbs_g: { name: "Carbs", color: "#F59E0B", unit: "g" }, // amber
      fat_g: { name: "Fat", color: "#EF4444", unit: "g" }, // red
      fiber_g: { name: "Fiber", color: "#10B981", unit: "g" }, // green
      sugar_g: { name: "Sugar", color: "#A855F7", unit: "g" }, // purple
    };

    return Object.entries(mapping).map(([key, meta]) => ({
      name: meta.name,
      value: data[key] ?? 0,
      color: meta.color,
      unit: meta.unit,
    }));
  }

  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const COLORS = ["#f97316", "#3b82f6", "#10b981", "#ef4444"];

  useEffect(() => {
    // Use 'nutrition' (singular) not 'nutritions'
    setNutritionData(normalizeNutritionForChart(recipe?.nutrition));
  }, [recipe]);

  // Custom tooltip to show units
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} {data.unit || "g"}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = (): JSX.Element => {
    if (chartType === "bar") {
      return (
        <BarChart
          data={nutritionData}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {nutritionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      );
    }
    if (chartType === "line") {
      return (
        <LineChart
          data={nutritionData}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      );
    }
    if (chartType === "pie") {
      return (
        <PieChart>
          <Pie
            data={nutritionData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) =>
              `${entry.name}: ${entry.value}${entry.unit || "g"}`
            }
          >
            {nutritionData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      );
    }

    // Fallback element to ensure a React element is always returned (prevents undefined)
    return <div className="text-sm text-gray-500">No chart available</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-8 sm:py-10">
        {/* Header with Back + Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="hover:bg-gray-100 dark:hover:bg-gray-800 -ml-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Planner
          </Button>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "details" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => setViewMode("details")}
            >
              <LayoutList className="w-4 h-4" />
              Details View
            </Button>
            <Button
              variant={viewMode === "graph" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => setViewMode("graph")}
            >
              <BarChart3 className="w-4 h-4" />
              Graph View
            </Button>
          </div>
        </div>

        {/* Header Card */}
        <Card className="border-2 shadow-xl mb-8 overflow-hidden">
          {/* Top Accent Line */}
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2" />

          {/* Image Preview */}
          {recipe.imageUrl && (
            <div className="w-full h-64 sm:h-80 overflow-hidden relative group cursor-pointer bg-gray-100">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-black/60 hover:bg-black/70 text-white border-0 flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm">
                  <ImageIcon className="w-4 h-4" />
                  View Full Image
                </Badge>
              </div>
            </div>
          )}

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* === HEADER (Title + Badge) === */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {!recipe.imageUrl && (
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {recipe.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      className={`${getCuisineColor(recipe.cuisineType)} border`}
                    >
                      {recipe.cuisineType} Cuisine
                    </Badge>
                    {recipe.healthConsiderations?.map(
                      (tag: string, index: number) => (
                        <Badge
                          key={`health-${index}`}
                          className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 border"
                        >
                          {tag}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* === STATS GRID === */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Cost */}
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Total Cost
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ${recipe.costAnalysis?.totalCost || 0}
                  </p>
                  {recipe.costAnalysis && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                      <p>${recipe.costAnalysis.costPerServing}/serving</p>
                      {recipe.costAnalysis.pantryItemsSavings > 0 && (
                        <p className="text-green-600 font-medium">
                          Saved ${recipe.costAnalysis.pantryItemsSavings} with
                          pantry
                        </p>
                      )}
                      {recipe.costAnalysis.budgetEfficiency && (
                        <p className="text-blue-600">
                          {Math.round(
                            recipe.costAnalysis.budgetEfficiency * 100,
                          )}
                          % Budget Eff.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Prep Time */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Prep Time
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {recipe.totalTimeMinutes || 0} min
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quick & Easy
                  </p>
                </div>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                    Servings
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    {recipe.servings}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    People
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {viewMode === "details" ? (
          <>
            {/* All your detailed sections here — unchanged */}
            {/* (Paste your existing Description, Ingredients, Instructions, etc.) */}
            <div className="space-y-6">
              <div className="space-y-6 pr-4">
                {/* Description */}
                {recipe.description && (
                  <Card className="border-2 shadow-md">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
                        About This Recipe
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {recipe.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Ingredients */}
                {recipe?.ingredients?.length > 0 && (
                  <Card className="border-2 shadow-md">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                        Ingredients
                      </h2>
                      <div className="grid gap-3">
                        {(Array.isArray(recipe.ingredients)
                          ? recipe.ingredients
                          : (JSON.parse(recipe.ingredients || "[]") as any[])
                        ).map((ingredient: any, index: any) => (
                          <div
                            key={index}
                            className="flex justify-between items-start p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {ingredient.quantity} {ingredient.unit}{" "}
                                  {ingredient.name}
                                </span>
                                {ingredient.notes && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {ingredient.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {ingredient.estimatedCost && (
                              <span className="text-sm font-bold text-green-600 ml-4">
                                ${ingredient.estimatedCost.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                {Array.isArray(recipe.instructions)
                  ? recipe.instructions
                  : JSON.parse(recipe.instructions)?.length > 0 && (
                      <Card className="border-2 shadow-md">
                        <CardContent className="p-6">
                          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                            Cooking Instructions
                          </h2>
                          <div className="space-y-4">
                            {(Array.isArray(recipe.instructions)
                              ? recipe.instructions
                              : (JSON.parse(recipe.instructions) as any[])
                            ).map((instruction: any, index: any) => (
                              <div key={index} className="flex gap-4 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                                  {index + 1}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
                                  {instruction}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                {/* Nutrition Information */}
                {recipe.nutrition && (
                  <Card className="border-2 shadow-md border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                        Nutrition Facts
                      </h2>

                      {/* Calories - Featured */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            Calories
                          </span>
                          <span className="text-3xl font-bold text-orange-600">
                            {recipe.nutrition.calories}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          per serving
                        </p>
                      </div>

                      {/* Macronutrients Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                        {/* Protein */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Protein
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {recipe.nutrition.protein_g}g
                          </p>
                        </div>

                        {/* Carbs */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Carbs
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-amber-600">
                            {recipe.nutrition.carbs_g}g
                          </p>
                        </div>

                        {/* Fat */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Fat
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-red-600">
                            {recipe.nutrition.fat_g}g
                          </p>
                        </div>

                        {/* Fiber */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Fiber
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {recipe.nutrition.fiber_g}g
                          </p>
                        </div>

                        {/* Sugar */}
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Sugar
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {recipe.nutrition.sugar_g}g
                          </p>
                        </div>

                        {/* Health Score */}
                        <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Apple className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Health Score
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {recipe.healthScore}/100
                          </p>
                        </div>
                      </div>

                      {/* Additional Nutrients */}
                      {(recipe.nutrition.sodium_mg ||
                        recipe.nutrition.cholesterol_mg) && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-3">
                            {recipe.nutrition.sodium_mg && (
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Sodium
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {recipe.nutrition.sodium_mg}mg
                                </span>
                              </div>
                            )}
                            {recipe.nutrition.cholesterol_mg && (
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Cholesterol
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {recipe.nutrition.cholesterol_mg}mg
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Nutritional Highlights */}
                {recipe.nutritionalHighlights &&
                  recipe.nutritionalHighlights.length > 0 && (
                    <Card className="border-2 shadow-md border-green-200 dark:border-green-800">
                      <CardContent className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-800 dark:text-green-200">
                          <Apple className="w-5 h-5" />
                          Nutritional Highlights
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {(recipe.nutritionalHighlights as any[]).map(
                            (highlight, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {highlight}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Cooking Tips */}
                {recipe.cookingTips && recipe.cookingTips.length > 0 && (
                  <Card className="border-2 shadow-md border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <Lightbulb className="w-5 h-5" />
                        Pro Cooking Tips
                      </h3>
                      <div className="space-y-3">
                        {recipe.cookingTips.map((tip: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-600 font-bold text-xs">
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {tip}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Complementary Items */}
                {recipe.complementaryItems &&
                  recipe.complementaryItems.length > 0 && (
                    <Card className="border-2 shadow-md border-purple-200 dark:border-purple-800">
                      <CardContent className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-800 dark:text-purple-200">
                          <UtensilsCrossed className="w-5 h-5" />
                          Served With (Included in Grocery List)
                        </h3>
                        <div className="grid gap-3">
                          {recipe.complementaryItems.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800"
                              >
                                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                  {item.quantity} {item.unit} {item.name}
                                  {item.optional && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs ml-2"
                                    >
                                      Optional
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-sm font-bold text-purple-600 ml-4">
                                  ${item.cost.toFixed(2)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* === NEW SECTIONS: AI Notes, Variations, Pantry, Sources === */}

                {/* AI Reasoning & Insights */}
                {recipe.aiReasoningNotes && (
                  <Card className="border-2 shadow-md border-indigo-200 dark:border-indigo-800">
                    <CardContent className="p-6 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20">
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Why This Recipe? (AI Insights)
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-indigo-300 pl-4 py-1">
                        "{recipe.aiReasoningNotes}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Variations */}
                {recipe.variations && recipe.variations.length > 0 && (
                  <Card className="border-2 shadow-md border-teal-200 dark:border-teal-800">
                    <CardContent className="p-6 bg-gradient-to-br from-teal-50/50 to-green-50/50 dark:from-teal-950/20 dark:to-green-950/20">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-teal-800 dark:text-teal-200">
                        <UtensilsCrossed className="w-5 h-5" />
                        Recipe Variations
                      </h3>
                      <ul className="space-y-3">
                        {recipe.variations.map(
                          (variation: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-teal-100 dark:border-teal-800"
                            >
                              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {variation}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Pantry Optimization */}
                {recipe.pantryOptimization &&
                  recipe.pantryOptimization.length > 0 && (
                    <Card className="border-2 shadow-md border-orange-200 dark:border-orange-800">
                      <CardContent className="p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-800 dark:text-orange-200">
                          <Leaf className="w-5 h-5" />
                          Pantry & Storage Tips
                        </h3>
                        <ul className="space-y-3">
                          {recipe.pantryOptimization.map(
                            (tip: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-orange-100 dark:border-orange-800"
                              >
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {tip}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                {/* Web Inspirations */}
                {recipe.webSourceInspirations &&
                  recipe.webSourceInspirations.length > 0 && (
                    <Card className="border-2 shadow-md border-gray-200 dark:border-gray-800">
                      <CardContent className="p-6 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                          <ExternalLink className="w-5 h-5" />
                          Inspirations & Sources
                        </h3>
                        <ul className="space-y-2">
                          {recipe.webSourceInspirations.map(
                            (source: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <span className="w-4 h-0.5 bg-gray-400 rounded-full" />
                                {source}
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>
          </>
        ) : (
          <Card className="border-2 shadow-md bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BarChart3 className="w-5 h-5" /> Nutritional Overview
              </h2>

              {/* Chart Type Selector */}
              <div className="flex gap-3 mb-6">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  onClick={() => setChartType("bar")}
                >
                  Bar Chart
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  onClick={() => setChartType("line")}
                >
                  Line Chart
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  onClick={() => setChartType("pie")}
                >
                  Pie Chart
                </Button>
              </div>

              <ResponsiveContainer width="100%" height={450}>
                {renderChart()}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
