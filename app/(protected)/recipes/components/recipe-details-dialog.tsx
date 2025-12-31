"use client";

import { Recipe } from "@/api/recipe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  DollarSign,
  Flame,
  Users,
  ChefHat,
  Utensils,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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
  if (!recipe) return null;

  // Prepare chart data
  const macrontrientsData = recipe.nutrition
    ? [
        {
          name: "Protein",
          value: recipe.nutrition.protein || 0,
          color: "#3b82f6",
        },
        {
          name: "Carbs",
          value: recipe.nutrition.carbohydrates || 0,
          color: "#ef4444",
        },
        { name: "Fat", value: recipe.nutrition.fat || 0, color: "#eab308" },
      ]
    : [];

  const costData = recipe.costAnalysis
    ? [
        { name: "Total Cost", amount: recipe.costAnalysis.totalCost },
        { name: "Per Serving", amount: recipe.costAnalysis.costPerServing },
      ]
    : [];

  const instructions = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : typeof recipe.instructions === "string"
      ? JSON.parse(recipe.instructions)
      : [];

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {recipe.name}
                <Badge
                  variant="outline"
                  className={getDifficultyColor(recipe.difficultyLevel)}
                >
                  {recipe.difficultyLevel}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-base">
                {recipe.cuisineType} • {recipe.mealType}
              </DialogDescription>
            </div>
            {recipe.healthScore && (
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">
                  Health Score
                </span>
                <span className="text-2xl font-bold text-green-500">
                  {recipe.healthScore}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="px-6 pb-2 shrink-0">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="analysis">Analytics & Cost</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Banner/Image */}
                <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 group">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                  ) : null}

                  {/* Fallback Gradient (shown if no image or on error) */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-[#3d326d] to-[#7661d3] ${recipe.imageUrl ? "hidden" : ""} flex items-center justify-center`}
                  >
                    <Utensils className="w-16 h-16 text-white/30" />
                  </div>

                  {/* Overlay for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-transparent to-transparent flex items-end p-8">
                    <div className="space-y-2">
                      <h2 className="text-white text-4xl font-extrabold shadow-sm tracking-tight">
                        {recipe.name}
                      </h2>
                      {/* Optional: Show Image Source/URL for verification if needed by user, hidden by default unless requested */}
                      {/* <p className="text-white/40 text-[10px] truncate max-w-md">{recipe.imageUrl}</p> */}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/20 border border-border/50">
                    <Clock className="h-6 w-6 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Total Time
                    </span>
                    <span className="font-bold">
                      {recipe.totalTimeMinutes}m
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/20 border border-border/50">
                    <Flame className="h-6 w-6 text-orange-500 mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Calories
                    </span>
                    <span className="font-bold">{recipe.calories}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/20 border border-border/50">
                    <Users className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Servings
                    </span>
                    <span className="font-bold">{recipe.servings}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/20 border border-border/50">
                    <DollarSign className="h-6 w-6 text-green-500 mb-2" />
                    <span className="text-sm text-muted-foreground">
                      $/Serving
                    </span>
                    <span className="font-bold">
                      ${Number(recipe.estimatedCostPerServing).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {recipe.description || "No description available."}
                  </p>
                </div>

                {recipe.aiReasoningNotes && (
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <ChefHat className="h-4 w-4" /> AI Chef Notes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {recipe.aiReasoningNotes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ingredients" className="mt-0">
                <div className="space-y-4 py-4">
                  <h3 className="font-semibold text-lg mb-4">
                    Ingredients ({recipe.ingredients?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recipe.ingredients?.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-accent"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-medium">{ing.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="mt-0">
                <div className="space-y-6 py-4">
                  {instructions.map((step: any, idx: number) => {
                    // Handle if step is object or string
                    const text =
                      typeof step === "string"
                        ? step
                        : step.step || step.instruction || JSON.stringify(step);
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="space-y-1 pt-1">
                          <p className="leading-relaxed">{text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                  {/* Macros Chart */}
                  <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <h3 className="font-semibold mb-4 text-center">
                      Nutritional Breakdown
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macrontrientsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {macrontrientsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {macrontrientsData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">
                            ({item.value}g)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className="p-6 rounded-xl bg-card border shadow-sm">
                    <h3 className="font-semibold mb-4 text-center">
                      Cost Analysis Breakdown
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tickFormatter={(val) => `$${val}`}
                          />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip
                            formatter={(value) =>
                              `$${Number(value).toFixed(2)}`
                            }
                          />
                          <Bar
                            dataKey="amount"
                            fill="#22c55e"
                            radius={[0, 4, 4, 0]}
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
