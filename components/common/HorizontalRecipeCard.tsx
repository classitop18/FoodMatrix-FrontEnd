import { useState } from "react";
import Image from "next/image";
import { Recipe } from "@/services/recipe";
import { getRecipeImageUrl } from "@/lib/recipe-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Clock,
    Flame,
    Star,
    DollarSign,
    ChevronRight,
    Trash2,
    Utensils,
    Heart,
    ShoppingCart
} from "lucide-react";
import { useInteractWithRecipeMutation } from "@/services/recipe";


interface HorizontalRecipeCardProps {
    recipe: Recipe;
    onViewDetails: (recipe: Recipe) => void;
    onRemove?: () => void; // Optional remove handler
    className?: string; // For additional styling
    showRemoveButton?: boolean;
}

export function HorizontalRecipeCard({
    recipe,
    onViewDetails,
    onRemove,
    className,
    showRemoveButton = false,
}: HorizontalRecipeCardProps) {
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
        <div
            className={cn(
                "group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row min-h-[160px] w-full transition-all hover:shadow-md hover:border-gray-200",
                className
            )}
            onClick={() => onViewDetails(recipe)}
        >
            {/* Left: Image Section */}
            <div className="relative w-[140px] md:w-[240px] shrink-0 bg-gray-100">
                {imageUrl && !hasError ? (
                    <Image
                        src={imageUrl}
                        alt={recipe.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 140px, 240px"
                        onError={() => setHasError(true)}
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3d326d] to-[#7661d3] flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-white/30" />
                    </div>
                )}

                {/* Favorite Button Overlay */}
                <button
                    onClick={(e) => handleInteraction(e, "favorite")}
                    className={cn(
                        "absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md border shadow-sm transition-all z-20",
                        recipe.isFavorite
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white/20 text-white border-white/30 hover:bg-white/40"
                    )}
                >
                    <Heart className={cn("w-3.5 h-3.5", recipe.isFavorite ? "fill-current" : "")} />
                </button>

                {/* Type Badge Overlay */}
                <div className="absolute bottom-2 left-2 pointer-events-none">
                    <Badge className="bg-white/90 text-[#3d326d] hover:bg-white text-[10px] font-bold px-2 py-0.5 shadow-sm backdrop-blur-sm border-none">
                        {recipe.mealType}
                    </Badge>
                </div>
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                        <h3 className="font-extrabold text-base md:text-xl text-[#313131] line-clamp-1 leading-tight group-hover:text-[#3d326d] transition-colors" title={recipe.name}>
                            {recipe.name}
                        </h3>
                        {showRemoveButton && onRemove ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 -mt-1 -mr-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove();
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        ) : recipe.averageRating !== undefined && (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                <span className="text-xs font-bold text-amber-700">
                                    {recipe.averageRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Cuisine & Difficulty */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold text-gray-500">{recipe.cuisineType}</span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            recipe.difficultyLevel === 'Easy' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                            recipe.difficultyLevel === 'Medium' && "bg-amber-50 text-amber-700 border-amber-100",
                            recipe.difficultyLevel === 'Hard' && "bg-rose-50 text-rose-700 border-rose-100",
                            !recipe.difficultyLevel && "bg-gray-50 text-gray-600 border-gray-100"
                        )}>
                            {recipe.difficultyLevel || 'Medium'}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                        {recipe.description || "A delicious meal waiting for you to cook. Click to view full details and instructions."}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100/50">
                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                            <Clock className="w-4 h-4 text-[#3d326d]" />
                            <span>{recipe.totalTimeMinutes || 30}m</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold hidden sm:flex">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span>{recipe.calories || 0} kcal</span>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[#7dab4f] font-extrabold text-sm">
                            <DollarSign className="w-4 h-4" />
                            {Number(recipe.estimatedCostPerServing || 0).toFixed(2)}
                        </div>
                        <Button
                            size="sm"
                            className="h-8 px-4 bg-[#F3F0FD] hover:bg-[#3d326d] text-[#3d326d] hover:text-white border border-[#3d326d]/10 hover:border-[#3d326d] rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                            Details <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
