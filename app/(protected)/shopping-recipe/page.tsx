"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Apple, Cake, Carrot, Check, Clock, Coffee, Cookie, DollarSign, Download, Flame, Heart, IndianRupee, ListCheck, Minus, PencilLine, Plus, Search, ShoppingCart, ThumbsDown, ThumbsUp, Trash, Wine } from "lucide-react";

import {
    RecipePayload,
    SlotProcessingState,
    Recipe,
} from "@/lib/recipe-constants";
import { Recipe as ApiRecipe } from "@/api/recipe";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ShoppingRecipe() {

    const [selections, setSelections] = useState<Record<string, string>>({});
    const [generatedRecipies, setGeneratedRecipies] = useState<
        Record<string, { recipes: Recipe[] }>
    >({});
    const [generatedCustomRecipies, setGeneratedCustomRecipies] = useState<
        Record<string, { recipes: Recipe[] }>
    >({});

    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const [recipePayload, setRecipePayload] = useState<RecipePayload>({});
    const [isSlotProcessing, setIsSlotProcessing] = useState<SlotProcessingState>(
        {},
    );

    const [detailedRecipe, setDetailedRecipe] = useState<ApiRecipe | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);


    const handleRecipeSelect = (recipe: any, slotKey: string) => {
        setSelections((prev) => ({ ...prev, [slotKey]: recipe.id }));
        if (!selectedRecipes.includes(recipe.id)) {
            setSelectedRecipes((prev) => [...prev, recipe.id]);
        }
    };

    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto">
            <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
                {/* Header */}

                <div className="flex flex-col items-start lg:items-center justify-between mb-6 gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#7dab4f] font-bold text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                            Smart Shopping
                        </span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">
                            Build Your Recipe-Driven Shopping List
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Start with recipes, add extra items, and finalize your groceries in one place.
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-6 py-4 mb-6">
                    <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
                        <ShoppingCart className="size-5 text-[var(--primary)]" />
                        Add Grocery Items
                    </div>

                    <div className="flex flex-wrap gap-4 lg:gap-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                                    <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                        <Carrot className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                        <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                                    </span>
                                    <div className="group-hover:hidden transition-all">Vegetables</div>
                                    <div className="hidden group-hover:flex transition-all">Add Items</div>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[522px] bg-white border-none">
                                <DialogHeader>
                                    <DialogTitle>Add Vegetables</DialogTitle>
                                </DialogHeader>
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        size={16}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search vegetables..."
                                        className="w-full pl-9 pr-3 py-2 bg-white/10 border border-[#E2E2E2] rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/20 transition-all text-sm font-normal h-13"
                                    />
                                    <Button
                                        className="text-white bg-(--primary) hover:bg-(--primary) font-medium ps-3! pe-3! py-1 h-10 rounded-lg text-base transition-all duration-300 cursor-pointer group relative flex items-center inset-shadow-[5px_5px_5px_rgba(0,0,0,0.30)] hover:inset-shadow-[-5px_-5px_5px_rgba(0,0,0,0.50)] min-w-26 justify-center absolute right-2 top-1/2 -translate-y-1/2">
                                        Search
                                    </Button>
                                </div>
                                <ScrollArea className="max-h-96">
                                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                                        <Link href="#" className="bg-[#E4DCFD] border border-[#C4B3FA] rounded-lg p-2 text-base flex items-center gap-4 hover:shadow-[0_4px_10px_-4px_rgba(0,0,0,0.08)] transition-all">
                                            <div className="size-12 bg-white rounded-md flex items-center justify-center text-xs">
                                                Img
                                            </div>
                                            Lettuce
                                        </Link>
                                        <Link href="#" className="bg-[#F4F1FD] border border-[#F4F1FD] rounded-lg p-2 text-base flex items-center gap-4 hover:shadow-[0_4px_10px_-4px_rgba(0,0,0,0.08)] transition-all">
                                            <div className="size-12 bg-white rounded-md flex items-center justify-center text-xs">
                                                Img
                                            </div>
                                            Lettuce
                                        </Link>
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border border-[#EDE9FF] rounded-xl">
                                    <div className="font-semibold mb-3">Adding: <span className="text-[var(--primary)]">Lettuce</span></div>

                                    <div className="flex gap-4 w-full items-end flex-wrap lg:flex-nowrap">
                                        <div className="flex flex-col gap-3 w-full md:w-auto">
                                            <Label>Quantity</Label>
                                            <div className="flex border border-[#e7e0fc] h-11 rounded-lg p-2 w-full md:w-auto">
                                                <Button className="!px-1 !h-full">
                                                    <Minus />
                                                </Button>
                                                <Input className="lg:max-w-10 lg:min-w-8 w-full !h-full !p-0 text-center focus:ring-0 shadow-none border-0" />
                                                <Button className="!px-1 !h-full">
                                                    <Plus />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full">
                                            <Label>Unit</Label>
                                            <Select>
                                                <SelectTrigger className="w-full rounded-lg shadow-none">
                                                    <SelectValue placeholder="Select a fruit" />
                                                </SelectTrigger>
                                                <SelectContent className="">
                                                    <SelectGroup>
                                                        <SelectItem value="apple">Apple</SelectItem>
                                                        <SelectItem value="banana">Banana</SelectItem>
                                                        <SelectItem value="blueberry">Blueberry</SelectItem>
                                                        <SelectItem value="grapes">Grapes</SelectItem>
                                                        <SelectItem value="pineapple">Pineapple</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button className="h-11 bg-[#F4F1FD] text-[var(--primary)] text-sm font-semibold">Add to Cart</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Apple className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                            </span>
                            <div className="group-hover:hidden transition-all">Fruits</div>
                            <div className="hidden group-hover:flex transition-all">Add Items</div>
                        </button>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Cookie className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                            </span>
                            <div className="group-hover:hidden transition-all">Snacks</div>
                            <div className="hidden group-hover:flex transition-all">Add Items</div>
                        </button>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Coffee className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                            </span>
                            <div className="group-hover:hidden transition-all">Beverages</div>
                            <div className="hidden group-hover:flex transition-all">Add Items</div>
                        </button>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Cake className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                            </span>
                            <div className="group-hover:hidden transition-all">Desserts</div>
                            <div className="hidden group-hover:flex transition-all">Add Items</div>
                        </button>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-white text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Wine className="size-8 group-hover:hidden transition-all" strokeWidth={1.2} />
                                <Plus className="size-8 hidden group-hover:flex transition-all" strokeWidth={1.2} />
                            </span>
                            <div className="group-hover:hidden transition-all">Drinks</div>
                            <div className="hidden group-hover:flex transition-all">Add Items</div>
                        </button>

                        <button type="button" className="border border-[#EDE9FF] rounded-xl p-4 bg-[var(--primary)] text-sm font-medium flex flex-col gap-2 justify-center items-center hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all group min-w-[108px]">
                            <span className="w-16 h-16 flex items-center justify-center bg-[#F4F1FD] rounded-full">
                                <Plus className="size-8" strokeWidth={1.2} />
                            </span>
                            <div className="text-white">Drinks</div>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap gap-4">
                    <div className="bg-gradient-to-r from-white via-[#F3F0FD] to-white border border-[#EDE9FF] rounded-xl p-4 w-full">

                        <div className="flex gap-3 items-center font-bold mb-4 flex-wrap">
                            <ListCheck className="size-5 text-[var(--primary)]" />
                            Shopping List Preview
                            <span className="rounded-full bg-[#F2EEFF] border border-[#e7e0fc] text-[var(--primary)] text-xs h-7 flex items-center px-3">6 Items</span>
                        </div>

                        <div className="border border-[#EDE9FF] p-4 rounded-xl bg-white">
                            <div className="flex justify-between gap-4 flex-wrap items-center relative pb-2">
                                <div className="flex gap-2 items-center font-bold">
                                    <Carrot className="size-5 group-hover:hidden transition-all" strokeWidth={1.2} />
                                    Vegetables
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="rounded-full bg-[#F2EEFF] border border-[#e7e0fc] text-[var(--primary)] text-xs h-7 flex items-center px-3">2 Items</span>
                                    <Button className="!p-0">
                                        <PencilLine className="size-4" />
                                    </Button>
                                    <Button className="!p-0">
                                        <Trash className="size-4 text-red-600" />
                                    </Button>
                                </div>

                                <div className="h-[1px] w-full bg-[linear-gradient(90deg,transparent_0%,#e9e3ff_50%,transparent_100%)] absolute bottom-0 left-0"></div>
                            </div>


                            <div className="flex flex-col gap-4 mt-4">
                                <div className="flex gap-4 flex-wrap justify-between w-full items-center">
                                    {/* w-full xl:w-1/2 */}
                                    <div className="flex gap-4 items-center w-full xl:w-60">
                                        <div className="min-w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                                            Image
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="line-clamp-1">Onion</h5>
                                            <span className="text-gray-400 text-sm">1 kg</span>
                                        </div>
                                    </div>
                                    <div className="flex border border-[#e7e0fc] h-11 rounded-lg p-2">
                                        <Button className="!px-2 !h-full">
                                            <Minus />
                                        </Button>
                                        <Input className="max-w-10 min-w-8 !h-full !p-0 text-center focus:ring-0 shadow-none border-0" />
                                        <Button className="!px-2 !h-full">
                                            <Plus />
                                        </Button>
                                    </div>
                                    <span className="flex gap-1 text-sm items-center lg:text-right lg:max-w-18">
                                        <IndianRupee className="size-4" /> 40.00
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:max-w-[550px] w-full bg-[#e9e2fe] rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-4 flex justify-between items-center">
                            AI Generated Recipes
                            <span className="text-sm font-normal">
                                {Object.values(generatedRecipies).reduce((acc, val) => acc + (val?.recipes?.length || 0), 0) +
                                    Object.values(generatedCustomRecipies).reduce((acc, val) => acc + (val?.recipes?.length || 0), 0)} Results
                            </span>
                        </div>

                        <ScrollArea className="w-full p-4">
                            <div className="space-y-2">
                                {Object.entries(generatedRecipies).length === 0 && Object.entries(generatedCustomRecipies).length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="text-sm">No recipes generated yet</p>
                                        <p className="text-xs mt-1">Select options and click Generate Recipes</p>
                                    </div>
                                ) : (
                                    Object.entries({ ...generatedRecipies, ...generatedCustomRecipies }).map(([slotKey, data]) => {
                                        const recipes = data?.recipes || [];
                                        if (recipes.length === 0) return null;

                                        const [date, meal] = slotKey.split('-');
                                        const shortDate = new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        });

                                        return (
                                            <div key={slotKey} className="space-y-2">
                                                <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-[#DDD6FA] sticky top-0 z-10">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{shortDate}</p>
                                                        <p className="text-xs text-gray-500">{recipes.length} Result{recipes.length > 1 ? 's' : ''}</p>
                                                    </div>
                                                    <span className="text-sm font-normal text-[var(--primary)]">{meal}</span>
                                                </div>

                                                {recipes.map((recipe) => {
                                                    const isSelected = selections[slotKey] === recipe.id;

                                                    return (
                                                        <div
                                                            key={recipe.id}
                                                            className="bg-white rounded-lg p-2 space-y-3 relative cursor-pointer hover:shadow-md transition-shadow"
                                                            onClick={() => handleRecipeSelect(recipe, slotKey)}
                                                        >
                                                            <div className="flex justify-between flex-col items-start">
                                                                <h3 className="font-bold text-gray-900 relative mb-2 pr-8">
                                                                    {recipe.name || 'Untitled Recipe'}
                                                                </h3>
                                                                <span
                                                                    className={`w-6 h-6 ${isSelected ? 'bg-amber-500' : 'bg-[var(--primary)]'} rounded-tr-md rounded-bl-md absolute top-0 right-0 flex items-center justify-center`}
                                                                >
                                                                    {isSelected ? (
                                                                        <Check className="size-4 text-white m-auto"></Check>
                                                                    ) : (
                                                                        <Plus className="size-4 text-white m-auto"></Plus>
                                                                    )}
                                                                </span>

                                                                <div className="flex gap-4 justify-between w-full">
                                                                    <p className="text-sm font-normal text-gray-500 line-clamp-2">
                                                                        {recipe.description || 'No description available'}
                                                                    </p>
                                                                    <div className="flex gap-3 flex-shrink-0">
                                                                        <ThumbsUp className="size-4 cursor-pointer hover:text-green-600 transition-colors"></ThumbsUp>
                                                                        <ThumbsDown className="size-4 cursor-pointer hover:text-red-600 transition-colors"></ThumbsDown>
                                                                        <Heart className="size-4 cursor-pointer hover:text-pink-600 transition-colors"></Heart>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-black justify-between flex-wrap">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="size-4"></Clock>
                                                                        <span>{recipe.prepTime || '30'} min</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Flame className="size-4"></Flame>
                                                                        <span>{recipe.nutrition?.calories || recipe.calories || '250'} cal</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <DollarSign className="size-4"></DollarSign>
                                                                        <span>{(recipe.price || recipe.costAnalysis?.totalCost || 5).toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                <Link
                                                                    href="#"
                                                                    className="text-sm font-medium text-[var(--primary)] underline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDetailedRecipe(recipe as any);
                                                                        setIsDetailsOpen(true);
                                                                    }}
                                                                >
                                                                    See more
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <div className="rounded-lg bg-[#e9e2fe] mt-5 p-4">
                    <div className="flex gap-3 items-center font-bold justify-between flex-wrap">
                        <div className="flex flex-col">
                            <div className="text-[var(--primary)]">Ready to shop?</div>
                            <span className="text-sm font-medium text-black/60">You have 10 items from 5 categories</span>
                        </div>

                        <Button variant={"outline"} type="button" className="border border-[var(--primary)] bg-white text-[var(--primary)]">
                            <Download /> Generate Shopping List
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
