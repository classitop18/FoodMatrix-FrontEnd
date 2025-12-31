"use client";

import { RecipeFilters } from "@/api/recipe";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { X, Filter, Clock, BadgeDollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface RecipeFiltersProps {
  filters: RecipeFilters;
  onFilterChange: (newFilters: RecipeFilters) => void;
  className?: string;
}

export function RecipeFiltersSidebar({
  filters,
  onFilterChange,
  className,
}: RecipeFiltersProps) {
  // Local state for immediate UI feedback while dragging
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync with parent when filters change externally (e.g. reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Update parent only when user stops dragging (onValueCommit)
  const handleRangeCommit = (
    minKey: keyof RecipeFilters,
    maxKey: keyof RecipeFilters,
    values: number[],
  ) => {
    const [min, max] = values;
    const newFilters = { ...filters, [minKey]: min, [maxKey]: max, page: 1 };
    onFilterChange(newFilters);
  };

  // Update local state for visual feedback
  const handleRangeChange = (
    minKey: keyof RecipeFilters,
    maxKey: keyof RecipeFilters,
    values: number[],
  ) => {
    const [min, max] = values;
    setLocalFilters((prev) => ({ ...prev, [minKey]: min, [maxKey]: max }));
  };

  const toggleArrayFilter = (key: "cuisines" | "mealTypes", value: string) => {
    const current = localFilters[key] ? localFilters[key]!.split(",") : [];
    const newArray = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    const newFilters = { ...localFilters, [key]: newArray.join(","), page: 1 };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#313131]">
          <div className="bg-[#3d326d]/10 p-2 rounded-lg text-[#3d326d]">
            <Filter size={18} />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">Filters</h3>
        </div>
        {(localFilters.cuisines ||
          localFilters.mealTypes ||
          localFilters.maxBudget ||
          localFilters.maxPrepTime) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFilterChange({
                page: 1,
                pageSize: filters.pageSize,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                dateFilter: filters.dateFilter,
                search: filters.search,
              })
            }
            className="h-8 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
          >
            Reset
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <Separator className="bg-gray-100" />

      <Accordion
        type="multiple"
        defaultValue={["budget", "time", "cuisine", "mealType"]}
        className="w-full"
      >
        {/* Budget Range - Dual Thumb Slider */}
        <AccordionItem value="budget" className="border-gray-100">
          <AccordionTrigger className="text-[#313131] font-bold text-sm py-4 hover:no-underline hover:text-[#3d326d]">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-gray-400" />
              Budget / Serving
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 px-1">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-medium text-gray-500">Range</span>
                <div className="flex items-center gap-2">
                  <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    <span className="text-[#313131] text-xs font-bold">
                      ${localFilters.minBudget || 0}
                    </span>
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    <span className="text-[#7dab4f] text-xs font-bold">
                      ${localFilters.maxBudget || 50}
                    </span>
                  </div>
                </div>
              </div>

              <Slider
                defaultValue={[
                  localFilters.minBudget || 0,
                  localFilters.maxBudget || 50,
                ]}
                minStepsBetweenThumbs={1}
                onValueChange={(vals) =>
                  handleRangeChange("minBudget", "maxBudget", vals)
                }
                onValueCommit={(vals) =>
                  handleRangeCommit("minBudget", "maxBudget", vals)
                }
                className="my-2 [&_[data-slot=slider-range]]:bg-[#3d326d] [&_[data-slot=slider-track]]:bg-gray-200"
              />

              <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                <span>$0</span>
                <span>$25</span>
                <span>$50+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Prep Time - Dual Thumb Slider */}
        <AccordionItem value="time" className="border-gray-100">
          <AccordionTrigger className="text-[#313131] font-bold text-sm py-4 hover:no-underline hover:text-[#3d326d]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Prep Time
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 px-1">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-medium text-gray-500">
                  Duration
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    <span className="text-[#313131] text-xs font-bold">
                      {localFilters.minPrepTime || 0}m
                    </span>
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    <span className="text-[#3d326d] text-xs font-bold">
                      {localFilters.maxPrepTime || 120}m
                    </span>
                  </div>
                </div>
              </div>

              <Slider
                defaultValue={[
                  localFilters.minPrepTime || 0,
                  localFilters.maxPrepTime || 120,
                ]}
                minStepsBetweenThumbs={1}
                onValueChange={(vals) =>
                  handleRangeChange("minPrepTime", "maxPrepTime", vals)
                }
                onValueCommit={(vals) =>
                  handleRangeCommit("minPrepTime", "maxPrepTime", vals)
                }
                className="my-2 [&_[data-slot=slider-range]]:bg-[#3d326d] [&_[data-slot=slider-track]]:bg-gray-200"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                <span>0m</span>
                <span>1h</span>
                <span>2h+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cuisine" className="border-gray-100">
          <AccordionTrigger className="text-[#313131] font-bold text-sm py-4 hover:no-underline hover:text-[#3d326d]">
            Cuisine
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3 pt-2">
                {[
                  "Italian",
                  "Mexican",
                  "Indian",
                  "Chinese",
                  "Japanese",
                  "Thai",
                  "French",
                  "Mediterranean",
                  "American",
                  "Korean",
                  "Greek",
                  "Spanish",
                ].map((cuisine) => (
                  <div
                    key={cuisine}
                    className="flex items-center space-x-3 group cursor-pointer"
                  >
                    <Checkbox
                      id={`cuisine-${cuisine}`}
                      checked={localFilters.cuisines
                        ?.split(",")
                        .includes(cuisine)}
                      onCheckedChange={() =>
                        toggleArrayFilter("cuisines", cuisine)
                      }
                      className="border-gray-300 data-[state=checked]:bg-[#3d326d] data-[state=checked]:border-[#3d326d] rounded-md h-5 w-5"
                    />
                    <Label
                      htmlFor={`cuisine-${cuisine}`}
                      className="text-sm font-medium text-gray-600 group-hover:text-[#3d326d] cursor-pointer"
                    >
                      {cuisine}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mealType" className="border-gray-100">
          <AccordionTrigger className="text-[#313131] font-bold text-sm py-4 hover:no-underline hover:text-[#3d326d]">
            Meal Type
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {[
                "Breakfast",
                "Lunch",
                "Dinner",
                "Snack",
                "Dessert",
                "Beverage",
              ].map((type) => (
                <div
                  key={type}
                  className="flex items-center space-x-3 group cursor-pointer"
                >
                  <Checkbox
                    id={`meal-${type}`}
                    checked={localFilters.mealTypes?.split(",").includes(type)}
                    onCheckedChange={() => toggleArrayFilter("mealTypes", type)}
                    className="border-gray-300 data-[state=checked]:bg-[#3d326d] data-[state=checked]:border-[#3d326d] rounded-md h-5 w-5"
                  />
                  <Label
                    htmlFor={`meal-${type}`}
                    className="text-sm font-medium text-gray-600 group-hover:text-[#3d326d] cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
