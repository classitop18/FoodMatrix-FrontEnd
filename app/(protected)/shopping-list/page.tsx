"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, CheckCircle2, ScanLine } from "lucide-react";
import { ReceiptUpload } from "@/components/receipts/ReceiptUpload";
import { ReceiptPreview } from "@/components/receipts/ReceiptPreview";
import { Receipt } from "@/services/receipt/types/receipt.types";

interface Recipe {
  id: string;
  name: string;
  ingredients?: any[];
}

export default function ShoppingListPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [scannedReceipts, setScannedReceipts] = useState<Receipt[]>([]);
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

  const handleReceiptUploadSuccess = (receipt: Receipt) => {
    setScannedReceipts((prev) => [...prev, receipt]);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-auto font-sans">
      <div className="max-w-8xl mx-auto px-4 md:px-6 relative z-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-[#F3F0FD] text-[#7661d3]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#313131] tracking-tight">Shopping List</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recipes & Actions */}
          <div className="lg:col-span-1 space-y-6">

            {/* Receipt Upload Section */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-bold text-[#313131] flex items-center gap-2 mb-4">
                <ScanLine className="w-5 h-5 text-[#7661d3]" />
                Scan Receipt
              </h2>
              <ReceiptUpload onUploadSuccess={handleReceiptUploadSuccess} />
            </div>

            {/* Selected Recipes List */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-bold text-[#313131] mb-4">
                Selected Recipes
              </h2>
              <div className="space-y-3">
                {recipes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recipes selected.</p>
                ) : (
                  recipes.map((r) => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm font-bold text-[#313131]">{r.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Consolidated List & Scanned Receipts */}
          <div className="lg:col-span-2 space-y-8">

            {/* Scanned Receipts Display */}
            {scannedReceipts.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-lg font-bold text-[#313131] mb-4">Scanned Receipts</h2>
                <div className="space-y-4">
                  {scannedReceipts.map((receipt) => (
                    <ReceiptPreview key={receipt.id} receipt={receipt} />
                  ))}
                </div>
              </div>
            )}

            {/* Consolidated List */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 bg-[#F3F0FD] rounded-lg flex items-center justify-center text-[#7661d3]">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#313131]">Consolidated List</h2>
                  <p className="text-sm text-gray-500">Combined ingredients from recipes and receipts</p>
                </div>
              </div>

              <div className="p-0">
                {recipes.length > 0 || scannedReceipts.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Recipe Ingredients */}
                      {recipes
                        .flatMap((r) => r.ingredients || [])
                        .map((ing: any, i) => (
                          <div
                            key={`recipe-${i}`}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#7661d3]/30 transition-colors"
                          >
                            <div className="h-5 w-5 rounded-full bg-[#e8f5e0] flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-[#7dab4f]" />
                            </div>
                            <span className="font-medium text-gray-700 text-sm">
                              {ing.quantity || ""} {ing.unit || ""} {ing.name}
                            </span>
                          </div>
                        ))}

                      {/* Scanned Receipt Items */}
                      {scannedReceipts
                        .flatMap((r) => r.items || [])
                        .map((item, i) => (
                          <div
                            key={`receipt-${i}`}
                            className="flex items-center gap-3 p-3 bg-[#F3F0FD]/50 rounded-xl border border-[#F3F0FD] group hover:border-[#7661d3]/30 transition-colors"
                          >
                            <div className="h-5 w-5 rounded-full bg-[#F3F0FD] flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-[#7661d3]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-700 text-sm">
                                {item.name}
                              </span>
                              {item.price && <span className="text-xs text-gray-500">${item.price}</span>}
                            </div>
                          </div>
                        ))}

                      {recipes.length === 0 && scannedReceipts.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-gray-400">
                          Your list is empty.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    Your list is empty.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
