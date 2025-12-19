"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { useState } from "react";

interface FoodPreferencesFormProps {
  excludedFoods: string[];
  includedFoods: string[];
  customExclusions: string[];
  customInclusions: string[];
  preferenceSets: string[];
  autoLearn: boolean;
  autoSwap: boolean;
  onExcludedFoodsChange: (foods: string[]) => void;
  onIncludedFoodsChange: (foods: string[]) => void;
  onCustomExclusionsChange: (exclusions: string[]) => void;
  onCustomInclusionsChange: (inclusions: string[]) => void;
  onPreferenceSetsChange: (sets: string[]) => void;
  onAutoLearnChange: (value: boolean) => void;
  onAutoSwapChange: (value: boolean) => void;
}

const FOOD_CATEGORIES = {
  Dairy: ["Milk", "Cheese", "Yogurt", "Butter", "Cream"],
  "Red Meat": ["Beef", "Lamb", "Pork"],
  Poultry: ["Chicken", "Turkey", "Duck"],
  Fish: ["Salmon", "Tuna", "Cod", "Shrimp"],
  Vegetables: [
    "Broccoli",
    "Spinach",
    "Carrots",
    "Tomatoes",
    "Onions",
    "Garlic",
    "Bell Peppers",
  ],
  Fruit: ["Apples", "Bananas", "Oranges", "Berries"],
  Grains: ["Wheat", "Rice", "Oats", "Quinoa"],
  "Nuts & Seeds": ["Almonds", "Walnuts", "Peanuts", "Sunflower Seeds"],
  Legumes: ["Beans", "Lentils", "Chickpeas", "Peas"],
  Eggs: ["Chicken Eggs", "Duck Eggs"],
  "Soy Products": ["Tofu", "Tempeh", "Soy Milk", "Edamame"],
  Sweeteners: ["Sugar", "Honey", "Maple Syrup", "Artificial Sweeteners"],
  Spices: ["Ginger", "Turmeric", "Cumin", "Cinnamon"],
};

const PRESET_PREFERENCE_SETS = {
  "No Dairy": {
    description: "Excludes all dairy products",
    excludes: ["Milk", "Cheese", "Yogurt", "Butter", "Cream"],
  },
  "Halal Only": {
    description: "Excludes pork and non-halal meats",
    excludes: ["Pork", "Duck"],
  },
  "Low FODMAP": {
    description: "Excludes high-FODMAP foods",
    excludes: ["Onions", "Garlic", "Wheat", "Apples", "Beans", "Milk"],
  },
  "Nut-Free": {
    description: "Excludes all nuts and seeds",
    excludes: ["Almonds", "Walnuts", "Peanuts", "Sunflower Seeds"],
  },
};

export function FoodPreferencesForm({
  excludedFoods,
  includedFoods,
  customExclusions,
  customInclusions,
  preferenceSets,
  autoLearn,
  autoSwap,
  onExcludedFoodsChange,
  onIncludedFoodsChange,
  onCustomExclusionsChange,
  onCustomInclusionsChange,
  onPreferenceSetsChange,
  onAutoLearnChange,
  onAutoSwapChange,
}: FoodPreferencesFormProps) {
  const [customExclusionInput, setCustomExclusionInput] = useState("");
  const [customInclusionInput, setCustomInclusionInput] = useState("");

  const toggleExcludedFood = (food: string) => {
    console.log(excludedFoods, "excludedFoodsexcludedFoods");

    if (excludedFoods.includes(food)) {
      onExcludedFoodsChange(excludedFoods.filter((f) => f !== food));
    } else {
      onExcludedFoodsChange([...excludedFoods, food]);
    }
  };

  const addCustomExclusion = () => {
    if (
      customExclusionInput.trim() &&
      !customExclusions.includes(customExclusionInput.trim())
    ) {
      onCustomExclusionsChange([
        ...customExclusions,
        customExclusionInput.trim(),
      ]);
      setCustomExclusionInput("");
    }
  };

  const removeCustomExclusion = (exclusion: string) => {
    onCustomExclusionsChange(customExclusions.filter((e) => e !== exclusion));
  };

  const addCustomInclusion = () => {
    if (
      customInclusionInput.trim() &&
      !customInclusions.includes(customInclusionInput.trim())
    ) {
      onCustomInclusionsChange([
        ...customInclusions,
        customInclusionInput.trim(),
      ]);
      setCustomInclusionInput("");
    }
  };

  const removeCustomInclusion = (inclusion: string) => {
    onCustomInclusionsChange(customInclusions.filter((i) => i !== inclusion));
  };

  const applyPreset = (presetName: string) => {
    const preset =
      PRESET_PREFERENCE_SETS[presetName as keyof typeof PRESET_PREFERENCE_SETS];
    if (preset) {
      const combined = [...excludedFoods, ...preset.excludes];
      const newExcluded = Array.from(new Set(combined));
      onExcludedFoodsChange(newExcluded);

      if (!preferenceSets.includes(presetName)) {
        onPreferenceSetsChange([...preferenceSets, presetName]);
      }
    }
  };

  const removePreset = (presetName: string) => {
    onPreferenceSetsChange(preferenceSets.filter((p) => p !== presetName));
  };

  return (
    <div className="space-y-10 p-6 rounded-2xl border bg-white dark:bg-black/40 shadow-md transition-all">
      {/* Presets Section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Quick Presets</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Apply preset dietary preferences instantly
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.keys(PRESET_PREFERENCE_SETS).map((name) => (
            <Button
              key={name}
              type="button"
              variant={preferenceSets?.includes(name) ? "default" : "outline"}
              size="sm"
              className="rounded-lg px-3 py-2"
              onClick={() => applyPreset(name)}
            >
              {name}
            </Button>
          ))}
        </div>

        {preferenceSets?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {preferenceSets?.map((preset) => (
              <Badge
                key={preset}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 rounded-full"
              >
                {preset}
                <button
                  type="button"
                  onClick={() => removePreset(preset)}
                  className="hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      <hr className="border-muted/40" />

      {/* Foods to Exclude */}
      <section>
        <h3 className="text-xl font-semibold mb-1">Foods to Exclude</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click to mark items you prefer not to include in meals
        </p>

        <div className="space-y-5">
          {Object.entries(FOOD_CATEGORIES).map(([category, foods]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {foods.map((food) => (
                  <Badge
                    key={food}
                    variant={
                      excludedFoods?.includes(food) ? "default" : "outline"
                    }
                    className={`cursor-pointer px-3 py-1 rounded-full transition-all ${
                      excludedFoods?.includes(food)
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "hover:bg-green-100 dark:hover:bg-green-900"
                    }`}
                    onClick={() => toggleExcludedFood(food)}
                  >
                    {food}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-muted/40" />

      {/* Custom Exclusions */}
      <section>
        <h3 className="text-xl font-semibold mb-1">Custom Exclusions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add any other foods you want to avoid
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            value={customExclusionInput}
            onChange={(e) => setCustomExclusionInput(e.target.value)}
            placeholder="e.g., shellfish, mushrooms"
          />
          <Button type="button" variant="outline" onClick={addCustomExclusion}>
            Add
          </Button>
        </div>

        {customExclusions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customExclusions?.map((exclusion) => (
              <Badge
                key={exclusion}
                variant="destructive"
                className="flex items-center gap-1 px-3 py-1 rounded-full"
              >
                {exclusion}
                <button onClick={() => removeCustomExclusion(exclusion)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Custom Inclusions */}
      <section>
        <h3 className="text-xl font-semibold mb-1">Custom Preferred Foods</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Foods you'd like to see more often in recipes
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            value={customInclusionInput}
            onChange={(e) => setCustomInclusionInput(e.target.value)}
            placeholder="e.g., avocado, quinoa"
          />
          <Button type="button" variant="outline" onClick={addCustomInclusion}>
            Add
          </Button>
        </div>

        {customInclusions?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customInclusions.map((inclusion) => (
              <Badge
                key={inclusion}
                className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 rounded-full"
              >
                {inclusion}
                <button onClick={() => removeCustomInclusion(inclusion)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Smart Settings */}
      <section className="pt-6 border-t space-y-4">
        <h3 className="text-xl font-semibold">Smart Settings</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-Learn Preferences</p>
            <p className="text-sm text-muted-foreground">
              Automatically adapt recommendations based on your selections
            </p>
          </div>
          <Switch checked={autoLearn} onCheckedChange={onAutoLearnChange} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Smart Ingredient Swap</p>
            <p className="text-sm text-muted-foreground">
              Suggest ingredient replacements based on selected limitations
            </p>
          </div>
          <Switch checked={autoSwap} onCheckedChange={onAutoSwapChange} />
        </div>
      </section>
    </div>
  );
}
