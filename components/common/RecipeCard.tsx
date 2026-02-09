"use client";

import { useState } from "react";
import { Recipe } from "@/services/recipe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Flame,
  DollarSign,
  Star,
  Utensils,
  ChevronRight,
  Calendar,
  Heart,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { useInteractWithRecipeMutation } from "@/services/recipe";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
  className?: string; // Added for flexibility
  compact?: boolean; // Added for compact view option
  selected?: boolean;
  selectionMode?: boolean;
  isCustom?: boolean;
  showAiBadge?: boolean;
}

export function RecipeCard({
  recipe,
  onViewDetails,
  className,
  compact = false,
  selected = false,
  selectionMode = false,
  isCustom = false,
  showAiBadge = false
}: RecipeCardProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getRecipeImageUrl(recipe.imageUrl);
  const { mutate: interact } = useInteractWithRecipeMutation();

  const handleInteraction = (
    e: React.MouseEvent,
    action: "like" | "dislike" | "favorite",
  ) => {
    e.stopPropagation();
    interact({ id: recipe.id, action });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden flex flex-col h-full",
        selected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-md"
          : "border-gray-200 hover:shadow-md hover:border-[#3d326d]/20",
        className
      )}
    >
      {/* Image/Gradient Header */}
      <div className={cn("relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800", compact ? "h-32" : "h-48")}>
        {imageUrl && !hasError ? (
          <Image
            src={imageUrl}
            alt={recipe.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={(err) => {
              setHasError(true);
            }}
            unoptimized
            priority={true}
          />
        ) : null}

        {/* Fallback Gradient (shown if no image or on error) */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[#3d326d] to-[#7661d3] group-hover:from-[#2d2454] group-hover:to-[#604abd] transition-colors duration-500 ${imageUrl && !hasError ? "hidden" : ""}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* Badges - Simplified for compact */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {/* Custom / AI Badges */}
          {isCustom && (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm border border-white/20">
              Custom
            </span>
          )}
          {showAiBadge && !isCustom && (
            <span className="bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm border border-white/20">
              AI
            </span>
          )}

          {/* Standard Badges */}
          {!compact && recipe.isPublic && (
            <span className="bg-[#7dab4f] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              Public
            </span>
          )}
          <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
            {recipe.mealType}
          </span>
          {!compact && (
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              {recipe.cuisineType}
            </span>
          )}
        </div>

        {/* Top Left Interaction Buttons OR Checkbox */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {selectionMode ? (
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm",
              selected
                ? "bg-green-500 border-green-500 scale-100" // Green check when selected
                : "bg-white/90 border-gray-300 hover:border-gray-400"
            )}>
              {selected && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </div>
          ) : (
            <button
              onClick={(e) => handleInteraction(e, "favorite")}
              className={cn(
                "p-2 rounded-full backdrop-blur-md border shadow-sm transition-all duration-300",
                recipe.isFavorite ? "bg-red-500 text-white border-red-500" : "bg-white/20 text-white border-white/30 hover:bg-white/40"
              )}
            >
              <Heart className={cn("w-4 h-4", recipe.isFavorite ? "fill-current" : "")} />
            </button>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-white/20 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#7dab4f]" />
            <span className="text-xs font-bold text-[#3d326d]">
              {Number(recipe.estimatedCostPerServing).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Title & Rating */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-extrabold text-base text-[#313131] leading-tight line-clamp-1 group-hover:text-[#3d326d] transition-colors" title={recipe.name}>
            {recipe.name}
          </h3>
          {recipe.averageRating !== undefined && (
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <span className="text-[10px] font-bold text-amber-700">
                {recipe.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {!compact && !isCustom && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
            {recipe.description || "A delicious meal waiting for you to cook."}
          </p>
        )}

        {/* Custom Recipe Health Note */}
        {isCustom && (
          <div className="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-1.5">
            <span className="text-amber-500 text-[10px] mt-0.5">⚠️</span>
            <p className="text-[10px] font-medium text-amber-800 leading-tight">
              Custom Request: Safety checks are advisory only.
            </p>
          </div>
        )}

        {/* Stats Grid - Simplified for compact */}
        <div className={cn("grid gap-2 mb-4", compact ? "grid-cols-2" : "grid-cols-2")}>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 p-1.5 rounded-md border border-gray-100">
            <Clock className="w-3 h-3 text-[#3d326d]" />
            <span>{recipe.totalTimeMinutes}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600 bg-gray-50 p-1.5 rounded-md border border-gray-100">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>{recipe.calories} kcal</span>
          </div>
        </div>

        {/* Action */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(recipe);
          }}
          className="w-full h-9 bg-[#F3F0FD] hover:bg-[#3d326d] text-[#3d326d] hover:text-white border border-[#3d326d]/10 hover:border-[#3d326d] rounded-lg text-xs font-semibold transition-all duration-300 group/btn mt-auto"
        >
          View Details
          <ChevronRight className="w-3 h-3 ml-1 text-[#3d326d] group-hover/btn:text-white transition-colors" />
        </Button>
      </div>
    </motion.div>
  );
}
