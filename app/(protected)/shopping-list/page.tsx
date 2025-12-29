"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Recipe {
    id: string;
    name: string;
    ingredients?: any[];
}

export default function ShoppingListPage() {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("foodmatrix-selected-recipes");
            if (saved) {
                const data = JSON.parse(saved);
                // data.additionalRecipes is a map of id -> recipe
                const list = Object.values(data.additionalRecipes || {}) as Recipe[];
                setRecipes(list);
            }
        } catch (e) {
            console.error("Error loading shopping list data", e);
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#F2F4F7] relative pb-20 font-sans">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#7dab4f]/10 to-transparent rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 max-w-5xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Shopping List</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recipes List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-bold text-gray-700">Selected Recipes</h2>
                        {recipes.length === 0 ? (
                            <p className="text-gray-500">No recipes selected.</p>
                        ) : (
                            recipes.map(r => (
                                <Card key={r.id} className="bg-white/80 backdrop-blur">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base font-bold">{r.name}</CardTitle>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Aggregated Ingredients (Mockup if actual aggregation logic is complex) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="border-0 shadow-lg bg-white">
                            <CardHeader className="bg-gradient-to-r from-[#7dab4f] to-[#5a8c3e] text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Consolidated List
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {recipes.length > 0 ? (
                                    <div className="space-y-6">
                                        <p className="text-sm text-gray-500 mb-4">
                                            This is a consolidated list of ingredients based on your selected recipes.
                                        </p>
                                        {/* In a real app, we would aggregate ingredients here */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {recipes.flatMap(r => r.ingredients || []).map((ing: any, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <CheckCircle2 className="w-4 h-4 text-[#7dab4f]" />
                                                    <span className="font-medium text-gray-700">
                                                        {ing.quantity || ''} {ing.unit || ''} {ing.name}
                                                    </span>
                                                </div>
                                            ))}
                                            {recipes.every(r => !r.ingredients || r.ingredients.length === 0) && (
                                                <div className="col-span-2 text-center py-10 text-gray-400">
                                                    No ingredient data available for these recipes.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-gray-400">
                                        Your list is empty.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
