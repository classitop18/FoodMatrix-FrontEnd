"use client";

import { Recipe, useInteractWithRecipeMutation } from "@/services/recipe";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Flame,
  X as XIcon,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Heart,
} from "lucide-react";
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
import { JSX, useEffect, useState } from "react";

interface RecipeDetailsDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetailsDialog({
  recipe,
  open,
  onOpenChange,
}: RecipeDetailsDialogProps) {
  const [viewMode, setViewMode] = useState<"details" | "graph">("details");
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const { mutate: interact } = useInteractWithRecipeMutation();

  const handleInteraction = (action: "like" | "dislike" | "favorite") => {
    if (recipe) {
      interact({ id: recipe.id, action });
    }
  };

  // Theme Colors
  const COLORS = ["#3d326d", "#7661d3", "#7dab4f", "#f97316", "#ef4444"];

  const getCuisineColor = (cuisine: string) => {
    // Return a consistent style, can be customized per cuisine if needed
    return "bg-[#3d326d]/5 text-[#3d326d] border-[#3d326d]/20";
  };

  function normalizeNutritionForChart(nutrition: any) {
    if (!nutrition) return [];

    let data = nutrition;
    if (Array.isArray(nutrition)) {
      if (nutrition.length > 0 && typeof nutrition[0] === "object") {
        data = nutrition[0];
      } else {
        return [];
      }
    }

    const mapping = {
      calories: { name: "Calories", color: "#f97316", unit: "kcal" },
      protein_g: { name: "Protein", color: "#3d326d", unit: "g" },
      carbs_g: { name: "Carbs", color: "#f59e0b", unit: "g" },
      fat_g: { name: "Fat", color: "#ef4444", unit: "g" },
      fiber_g: { name: "Fiber", color: "#10b981", unit: "g" },
      sugar_g: { name: "Sugar", color: "#a855f7", unit: "g" },
    };

    return Object.entries(mapping).map(([key, meta]) => ({
      name: meta.name,
      value: data[key] ?? 0,
      color: meta.color,
      unit: meta.unit,
    }));
  }

  useEffect(() => {
    if (recipe?.nutrition) {
      setNutritionData(normalizeNutritionForChart(recipe.nutrition));
    }
  }, [recipe]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
          <p className="font-bold text-[#3d326d]">{data.name}</p>
          <p className="text-sm font-medium text-gray-600">
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
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F3F4F6" }} />
          <Legend />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
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
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3d326d"
            strokeWidth={3}
            dot={{ r: 4, fill: "#3d326d" }}
            activeDot={{ r: 6 }}
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
            innerRadius={60}
            paddingAngle={5}
            label={(entry) => `${entry.name}`}
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

    return <div className="text-sm text-gray-500">No chart available</div>;
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] md:max-w-screen-xl h-[95vh] p-0 overflow-hidden flex flex-col bg-[#F9FAFB] border-none outline-none shadow-2xl rounded-2xl"
      >
        {/* Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">{recipe.name} Details</DialogTitle>

        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#3d326d] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="hidden md:block h-6 w-px bg-gray-200" />
            <h2 className="text-lg font-bold text-[#313131] truncate max-w-[200px] md:max-w-md">
              {recipe.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("details")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === "details"
                    ? "bg-white text-[#3d326d] shadow-sm"
                    : "text-gray-500 hover:text-[#313131]"
                  }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Details
              </button>
              <button
                onClick={() => setViewMode("graph")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === "graph"
                    ? "bg-white text-[#3d326d] shadow-sm"
                    : "text-gray-500 hover:text-[#313131]"
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analysis
              </button>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 hover:bg-white hover:shadow-sm rounded-lg ${recipe.isLiked
                    ? "text-green-600 bg-white shadow-sm"
                    : "text-gray-500"
                  }`}
                onClick={() => handleInteraction("like")}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${recipe.isLiked ? "fill-current" : ""}`}
                />
              </Button>
              <div className="w-[1px] h-4 bg-gray-300" />
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 hover:bg-white hover:shadow-sm rounded-lg ${recipe.isDisliked
                    ? "text-red-500 bg-white shadow-sm"
                    : "text-gray-500"
                  }`}
                onClick={() => handleInteraction("dislike")}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${recipe.isDisliked ? "fill-current" : ""
                    }`}
                />
              </Button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className={`h-10 w-10 rounded-full border transition-all ${recipe.isFavorite
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-400 border-gray-200 hover:border-red-200 hover:text-red-400"
                }`}
              onClick={() => handleInteraction("favorite")}
            >
              <Heart
                className={`w-5 h-5 ${recipe.isFavorite ? "fill-current" : ""}`}
              />
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="bg-[#F9FAFB] min-h-full p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Hero Section */}
              <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100 group">
                {getRecipeImageUrl(recipe.imageUrl) ? (
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="relative w-full md:w-1/3 h-48 md:h-64 overflow-hidden">
                      <img
                        src={getRecipeImageUrl(recipe.imageUrl)!}
                        alt={recipe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#3d326d]/90" />
                    </div>
                    <div className="relative p-6 md:p-8 text-white bg-[#3d326d] md:w-2/3 flex flex-col justify-center">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-[#7dab4f] hover:bg-[#6c9643] text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                            {recipe.cuisineType}
                          </Badge>
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                            {recipe.mealType}
                          </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                          {recipe.name}
                        </h1>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                          <Sparkles className="w-4 h-4" />
                          <span>AI-Generated Recipe</span>
                        </div>

                        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/60 text-xs font-bold uppercase">
                              Total Cost
                            </p>
                            <div className="flex items-center gap-1 text-[#7dab4f]">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-xl font-extrabold">
                                {recipe.costAnalysis?.totalCost || 0}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-bold uppercase">
                              Calories
                            </p>
                            <div className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-4 h-4" />
                              <span className="text-xl font-extrabold">
                                {recipe.calories}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3d326d] to-[#7661d3] opacity-90" />
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-12 -mt-12" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -ml-10 -mb-10" />

                    <div className="relative p-8 md:p-10 text-white flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                          <ChefHat className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-[#7dab4f] hover:bg-[#6c9643] text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                              {recipe.cuisineType}
                            </Badge>
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                              {recipe.mealType}
                            </Badge>
                          </div>
                          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                            {recipe.name}
                          </h1>
                          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Generated Recipe</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 min-w-[100px]">
                          <span className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                            Total Cost
                          </span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-5 h-5 text-[#7dab4f]" />
                            <span className="text-2xl font-extrabold">
                              {recipe.costAnalysis?.totalCost || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 min-w-[100px]">
                          <span className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                            Calories
                          </span>
                          <div className="flex items-center gap-1">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-2xl font-extrabold">
                              {recipe.calories}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-[#3d326d]/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#3d326d]/5 flex items-center justify-center text-[#3d326d]">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Prep Time
                    </p>
                    <p className="text-lg font-extrabold text-[#313131]">
                      {recipe.totalTimeMinutes}m
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-[#3d326d]/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Per Serving
                    </p>
                    <p className="text-lg font-extrabold text-[#313131]">
                      ${Number(recipe.estimatedCostPerServing).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-[#3d326d]/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Servings
                    </p>
                    <p className="text-lg font-extrabold text-[#313131]">
                      {recipe.servings}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-[#3d326d]/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Health Score
                    </p>
                    <p className="text-lg font-extrabold text-[#313131]">
                      {recipe.healthScore}/100
                    </p>
                  </div>
                </div>
              </div>

              {viewMode === "details" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Ingredients, Description (7 cols) */}
                  <div className="lg:col-span-7 space-y-8">
                    {/* Description Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-white">
                      <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />
                      <CardContent className="p-6 md:p-8">
                        <h3 className="text-xl font-extrabold text-[#313131] mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-500" />
                          About this Recipe
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-base font-medium">
                          {recipe.description ||
                            "A wonderful recipe ready for you to explore."}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Ingredients Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-white">
                      <div className="h-1.5 bg-gradient-to-r from-[#7dab4f] to-green-400" />
                      <CardContent className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-extrabold text-[#313131] flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5 text-[#7dab4f]" />
                            Ingredients
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-gray-500 bg-gray-50"
                          >
                            {recipe.ingredients?.length || 0} Items
                          </Badge>
                        </div>

                        <div className="grid gap-3">
                          {(Array.isArray(recipe.ingredients)
                            ? recipe.ingredients
                            : (JSON.parse(
                              (recipe.ingredients as any) || "[]",
                            ) as any[])
                          ).map((ingredient, index) => (
                            <div
                              key={index}
                              className="group flex items-center justify-between p-4 bg-[#F9FAFB] hover:bg-[#F3F0FD] rounded-xl border border-gray-100 hover:border-[#3d326d]/20 transition-all duration-300"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-[#3d326d] group-hover:text-white group-hover:border-transparent transition-colors">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-[#313131] group-hover:text-[#3d326d] transition-colors">
                                    {ingredient.name}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium">
                                    {ingredient.quantity} {ingredient.unit}
                                  </p>
                                </div>
                              </div>

                              {ingredient.estimatedCost && (
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[#7dab4f]">
                                    $
                                    {Number(ingredient.estimatedCost).toFixed(
                                      2,
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complementary Items */}
                    {recipe.complementaryItems &&
                      (recipe.complementaryItems as any[]).length > 0 && (
                        <Card className="border-none shadow-md overflow-hidden bg-white">
                          <div className="h-1.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                          <CardContent className="p-6 md:p-8">
                            <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-purple-500" />
                              Perfect Pairings
                            </h3>
                            <div className="grid gap-3">
                              {(recipe.complementaryItems as any[]).map(
                                (item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                                      <span className="font-bold text-gray-700">
                                        {item.name}
                                      </span>
                                      {item.optional && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] bg-white text-gray-500"
                                        >
                                          Optional
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="font-bold text-purple-600">
                                      ${item.cost?.toFixed(2)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>

                  {/* Right Column: Instructions, Nutrition (5 cols) */}
                  <div className="lg:col-span-5 space-y-8">
                    {/* Instructions */}
                    <Card className="border-none shadow-md overflow-hidden bg-white h-fit">
                      <div className="h-1.5 bg-gradient-to-r from-[#3d326d] to-[#7661d3]" />
                      <CardContent className="p-6 md:p-8">
                        <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-[#3d326d]" />
                          Instructions
                        </h3>

                        <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
                          {(Array.isArray(recipe.instructions)
                            ? recipe.instructions
                            : (JSON.parse(recipe.instructions as any) as any[])
                          ).map((instruction, index) => (
                            <div key={index} className="relative pl-8 group">
                              {/* Step Number Bubble */}
                              <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 group-hover:border-[#3d326d] group-hover:scale-110 transition-all duration-300">
                                <span className="text-sm font-extrabold text-[#3d326d]">
                                  {index + 1}
                                </span>
                              </div>

                              <div className="pt-1">
                                <p className="text-gray-600 font-medium leading-relaxed group-hover:text-[#313131] transition-colors">
                                  {typeof instruction === "string"
                                    ? instruction
                                    : JSON.stringify(instruction)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Nutrition Card */}
                    <Card className="border-none shadow-md overflow-hidden bg-white">
                      <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400" />
                      <CardContent className="p-6 md:p-8">
                        <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Nutrition Overview
                        </h3>

                        <div className="space-y-4">
                          {/* Protein */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-gray-600">Protein</span>
                              <span className="text-blue-600">
                                {recipe.nutrition?.protein_g}g
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.min((recipe.nutrition?.protein_g || 0) * 1.5, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Carbs */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-gray-600">Carbs</span>
                              <span className="text-amber-500">
                                {recipe.nutrition?.carbs_g}g
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{
                                  width: `${Math.min(recipe.nutrition?.carbs_g || 0, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Fat */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-gray-600">Fat</span>
                              <span className="text-red-500">
                                {recipe.nutrition?.fat_g}g
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-400 rounded-full"
                                style={{
                                  width: `${Math.min((recipe.nutrition?.fat_g || 0) * 2, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            onClick={() => setViewMode("graph")}
                            variant="outline"
                            className="w-full mt-4 border-dashed border-gray-300 text-gray-500 hover:text-[#3d326d] hover:border-[#3d326d]"
                          >
                            View Full Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-[#3d326d] to-[#7661d3]" />
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                      <h2 className="text-2xl font-extrabold text-[#313131] flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-[#3d326d]" />
                        Nutritional Analysis
                      </h2>

                      <div className="flex bg-gray-100 p-1 rounded-xl mt-4 md:mt-0">
                        {(["bar", "line", "pie"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${chartType === type
                                ? "bg-white text-[#3d326d] shadow-sm scale-105"
                                : "text-gray-500 hover:text-[#313131]"
                              }`}
                          >
                            {type} Chart
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[500px] w-full bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                      <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed Breakdowns Grid below chart */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                      {nutritionData.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3"
                        >
                          <div
                            className="w-3 h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              {item.name}
                            </p>
                            <p className="text-xl font-extrabold text-[#313131]">
                              {item.value}
                              <span className="text-sm font-medium text-gray-400 ml-1">
                                {item.unit}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
