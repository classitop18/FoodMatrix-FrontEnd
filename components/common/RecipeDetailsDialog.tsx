"use client";

import { Recipe, useInteractWithRecipeMutation } from "@/services/recipe";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
  Package,
  Zap,
  Repeat,
  TrendingUp,
  CheckCircle2,
  Scale,
} from "lucide-react";
import {
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
  ResponsiveContainer,
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
          width={500}
          height={300}
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
    // ... Other chart types (omitted for brevity, assume similar logic or import from original if needed, but for now I'll stick to basic)
    if (chartType === "line") {
      return (
        <LineChart
          width={500}
          height={300}
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
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
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
        </div>
      );
    }
    return <div className="text-sm text-gray-500">No chart available</div>;
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] md:max-w-screen-xl h-[95vh] p-0 overflow-hidden flex flex-col bg-[#F9FAFB] border-none outline-none shadow-2xl rounded-2xl"
      >
        {!recipe ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#3d326d]/20 border-t-[#3d326d] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-[#3d326d]" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-600 animate-pulse">Fetching delicious details...</p>
          </div>
        ) : (
          <>
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
                              <Badge className="bg-amber-500/80 hover:bg-amber-500 text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                {recipe.difficultyLevel}
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
                                <Badge className="bg-amber-500/80 hover:bg-amber-500 text-white border-none px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                                  {recipe.difficultyLevel}
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
                    {/* ... other stats ... */}
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
                                      <p className="font-bold text-[#313131] group-hover:text-[#3d326d] transition-colors flex items-center gap-2">
                                        {ingredient.name}
                                        {ingredient.isPantryItem && (
                                          <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full border border-indigo-200 uppercase font-bold tracking-wider">Pantry</span>
                                        )}
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

                        {/* Cost Analysis Card */}
                        {recipe.costAnalysis && (
                          <Card className="border-none shadow-md overflow-hidden bg-white">
                            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                            <CardContent className="p-6 md:p-8">
                              <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-emerald-500" />
                                Cost Breakdown
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                  <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total Cost</p>
                                  <p className="text-2xl font-extrabold text-[#313131]">${recipe.costAnalysis.totalCost.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">Per Serving</p>
                                  <p className="text-2xl font-extrabold text-[#313131]">${recipe.costAnalysis.costPerServing.toFixed(2)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Health Restrictions Card - RED (Warning) */}
                        {((recipe as any).suitabilityAnalysis?.notSuitableFor?.length > 0 || (recipe as any).suitabilityAnalysis?.riskNote) && (
                          <Card className="border-none shadow-md overflow-hidden bg-white">
                            <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
                            <CardContent className="p-6 md:p-8">
                              <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500" />
                                Health Warnings & Restrictions
                              </h3>

                              <div className="space-y-6">
                                {/* Risk Note */}
                                {(recipe as any).suitabilityAnalysis?.riskNote && (
                                  <div className="bg-red-50/80 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
                                    <span className="text-lg">⚠️</span>
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-wider mb-1 text-red-600">Important Advisory</p>
                                      <p className="text-sm font-bold leading-relaxed">{(recipe as any).suitabilityAnalysis.riskNote}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Not Suitable For List */}
                                {((recipe as any).suitabilityAnalysis?.notSuitableFor || []).length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-xs text-red-500 font-bold uppercase flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-red-500" />
                                      Not Suitable For
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {(recipe as any).suitabilityAnalysis.notSuitableFor.map((item: string, i: number) => (
                                        <Badge
                                          key={i}
                                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 px-3 py-1 text-sm font-semibold"
                                          variant="outline"
                                        >
                                          <XIcon className="w-3 h-3 mr-1.5" />
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                      This recipe contains ingredients that conflict with these health profiles.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Suitability/Benefits Card - GREEN (Positive) */}
                        {((recipe as any).suitabilityAnalysis?.suitableFor?.length > 0) && (
                          <Card className="border-none shadow-md overflow-hidden bg-white">
                            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-green-500" />
                            <CardContent className="p-6 md:p-8">
                              <h3 className="text-xl font-extrabold text-[#313131] mb-6 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                Dietary Suitability
                              </h3>

                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {(recipe as any).suitabilityAnalysis.suitableFor.map((item: string, i: number) => (
                                    <Badge
                                      key={i}
                                      className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3 py-1 text-sm font-semibold"
                                      variant="outline"
                                    >
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                  This recipe aligns well with these dietary preferences.
                                </p>
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
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-xl min-h-[500px]">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-extrabold text-[#313131]">Nutritional Analysis</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          {(["bar", "line", "pie"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setChartType(t)}
                              className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${chartType === t ? "bg-white shadow-sm text-[#3d326d]" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Render Chart */}
                      <div className="w-full flex justify-center">
                        <ResponsiveContainer width="100%" height={400}>
                          {renderChart()}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
