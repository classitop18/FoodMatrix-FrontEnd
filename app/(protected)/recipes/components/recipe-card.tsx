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
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { useInteractWithRecipeMutation } from "@/services/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onViewDetails }: RecipeCardProps) {
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
      className="group relative bg-white rounded-lg shadow-none border border-gray-200 hover:shadow-xl hover:border-[#3d326d]/20 transition-all duration-300 overflow-hidden flex flex-col items-start h-full"
    >
      {/* Image/Gradient Header */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
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
          className={`absolute inset-0 bg-gradient-to-br from-[#3d326d] to-[#7661d3] group-hover:from-[#2d2454] group-hover:to-[#604abd] transition-colors duration-500 ${imageUrl && !hasError ? "hidden" : ""
            }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {recipe.isPublic && (
            <span className="bg-[#7dab4f] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
              Public
            </span>
          )}
          <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
            {recipe.mealType}
          </span>
          <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
            {recipe.cuisineType}
          </span>
        </div>

        {/* Top Left Interaction Buttons (Overlay) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => handleInteraction(e, "favorite")}
            className={`p-2 rounded-full backdrop-blur-md border shadow-sm transition-all duration-300 ${recipe.isFavorite
              ? "bg-red-500 text-white border-red-500"
              : "bg-white/20 text-white border-white/30 hover:bg-white/40"
              }`}
          >
            <Heart
              className={`w-4 h-4 ${recipe.isFavorite ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-white/20 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#7dab4f]" />
            <span className="text-sm font-extrabold text-[#3d326d]">
              {Number(recipe.estimatedCostPerServing).toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">/srv</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title & Rating */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-extrabold text-lg text-[#313131] leading-tight line-clamp-1 group-hover:text-[#3d326d] transition-colors">
            {recipe.name}
          </h3>
          {recipe.averageRating !== undefined && (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-current" />
              <span className="text-xs font-bold text-amber-700">
                {recipe.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {recipe.description || "A delicious meal waiting for you to cook."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Clock className="w-3.5 h-3.5 text-[#3d326d]" />
            <span>{recipe.totalTimeMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>{recipe.calories} kcal</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Generated:{" "}
              {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        {/* <div className="flex items-center gap-2 w-full mb-3">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100 mr-auto">
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 hover:bg-white hover:shadow-sm ${recipe.isLiked ? "text-green-600 bg-green-50" : "text-gray-400"
                }`}
              onClick={(e) => handleInteraction(e, "like")}
            >
              <ThumbsUp
                className={`w-4 h-4 ${recipe.isLiked ? "fill-current" : ""}`}
              />
            </Button>
            <div className="w-[1px] h-4 bg-gray-200" />
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 hover:bg-white hover:shadow-sm ${recipe.isDisliked ? "text-red-500 bg-red-50" : "text-gray-400"
                }`}
              onClick={(e) => handleInteraction(e, "dislike")}
            >
              <ThumbsDown
                className={`w-4 h-4 ${recipe.isDisliked ? "fill-current" : ""}`}
              />
            </Button>
          </div>
          <div className="text-xs font-medium text-gray-400">
            {recipe.score !== undefined && recipe.score !== 0
              ? `Score: ${recipe.score}`
              : ""}
          </div>
        </div> */}

        {/* Action */}
        <Button
          onClick={() => onViewDetails(recipe)}
          className="w-full h-10 bg-[#F3F0FD] hover:bg-[#3d326d] text-[#3d326d] hover:text-white border border-[#3d326d]/10 hover:border-[#3d326d] rounded-lg font-medium transition-all duration-300 group/btn"
        >
          View Details
          <ChevronRight className="w-4 h-4 text-[#3d326d] group-hover/btn:text-white transition-colors" />
        </Button>
      </div>
    </motion.div>
  );
}
