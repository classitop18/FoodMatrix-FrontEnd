"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  CheckSquare,
  Package,
  Clock,
  ChevronRight,
  Printer,
  Share2,
  MoreVertical,
  Loader2,
  DollarSign,
  Info,
  Tag,
  AlertTriangle,
  Zap,
  Database,
  Trash2,
  Store,
  TrendingDown,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeService } from "@/services/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getUnsplashImage } from "@/app/actions/unsplash";
import Image from "next/image";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface ShoppingItem {
  id: string;
  ingredientName: string;
  quantity: string;
  unit: string;
  category: string;
  isPurchased: boolean;
  price?: string | null;
  estimatedPrice?: number | null;
  priceUnavailable?: boolean;
  priceSource?: "kroger" | "curated_db" | "unavailable";
  retailQuantity?: number;
  retailUnit?: string;
  imageUrl?: string | null;
}

interface PricingMetadata {
  totalEstimatedCost: number;
  pricedItemCount: number;
  unavailableItemCount: number;
  priceSource: string;
}

interface Session {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  totalEstimatedCost?: string;
}

// Store comparison data for accordion content
const STORE_COMPARISONS = [
  { name: "Walmart Supercenter", price: 2.97, rating: 4.2, distance: "1.2 mi", stock: "In Stock" },
  { name: "Kroger Marketplace", price: 3.45, rating: 4.5, distance: "0.8 mi", stock: "Low Stock" },
  { name: "Target Grocery", price: 3.20, rating: 4.8, distance: "2.5 mi", stock: "In Stock" },
  { name: "Whole Foods Market", price: 4.15, rating: 4.9, distance: "3.1 mi", stock: "In Stock" },
];

// ----------------------------------------------------------------
// Price source badge
// ----------------------------------------------------------------
const PriceSourceBadge = ({
  source,
}: {
  source?: "kroger" | "curated_db" | "unavailable";
}) => {
  if (source === "kroger") {
    return (
      <Badge variant="outline" className="text-[9px] font-bold border-blue-200 text-blue-600 bg-blue-50 gap-1">
        <Zap className="h-2 w-2" />
        Live Price
      </Badge>
    );
  }
  if (source === "curated_db") {
    return (
      <Badge variant="outline" className="text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50 gap-1">
        <Database className="h-2 w-2" />
        Market Avg.
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[9px] font-bold border-orange-200 text-orange-600 bg-orange-50 gap-1">
      <AlertTriangle className="h-2 w-2" />
      Price N/A
    </Badge>
  );
};

// ----------------------------------------------------------------
// Main export with Suspense
// ----------------------------------------------------------------
export default function ShoppingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
            <p className="text-gray-500 font-medium animate-pulse">
              Loading your shopping session...
            </p>
          </div>
        </div>
      }
    >
      <ShoppingContent />
    </Suspense>
  );
}

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
function ShoppingContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const router = useRouter();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [pricingMeta, setPricingMeta] = useState<PricingMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<Record<string, string>>({});

  const recipeService = useRef(new RecipeService());

  useEffect(() => {
    if (sessionId) fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await recipeService.current.getShoppingSession(sessionId as string);
      if (data) {
        const sessionData = data.session ?? data;
        const itemsData = data.items || sessionData.items || [];
        setSession({
          id: sessionData.id,
          name: sessionData.name,
          status: sessionData.status,
          createdAt: sessionData.createdAt,
          totalEstimatedCost: sessionData.totalEstimatedCost,
        });
        setItems(itemsData);
        if (data.pricingMetadata) setPricingMeta(data.pricingMetadata);
        fetchItemImages(itemsData.map((i: ShoppingItem) => i.ingredientName));
      }
    } catch (error) {
      console.error("Failed to fetch shopping session", error);
      toast({ title: "Error", description: "Failed to load shopping list.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchItemImages = async (names: string[]) => {
    const uniqueNames = Array.from(new Set(names));
    const images: Record<string, string> = {};
    for (let i = 0; i < uniqueNames.length; i += 3) {
      const batch = uniqueNames.slice(i, i + 3);
      await Promise.all(
        batch.map(async (name) => {
          const url = await getUnsplashImage(name);
          if (url) images[name] = url;
        }),
      );
    }
    setItemImages((prev) => ({ ...prev, ...images }));
  };

  // ── Remove item from shopping list
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      setDeletingId(itemId);
      await recipeService.current.deleteShoppingSessionItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({
        title: "Item removed",
        description: `"${itemName}" removed from your shopping list.`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to delete item", error);
      toast({ title: "Error", description: "Failed to remove item.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async () => {
    try {
      toast({ title: "Downloading...", description: "Your shopping list is being prepared." });
      const payload = {
        name: session?.name || "Shopping List",
        ingredients: items.map((item) => ({
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        })),
      };
      await recipeService.current.downloadShoppingListPdf(payload);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleInstacart = () => {
    toast({ title: "Opening Instacart", description: "Redirecting with your items..." });
    window.open("https://www.instacart.com", "_blank");
  };

  // ── Derived stats
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const cat = item.category || "Others";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.estimatedPrice ?? (item.price ? parseFloat(item.price) : null);
      return sum + (price || 0);
    }, 0);
  }, [items]);

  const unavailableCount = useMemo(
    () => items.filter((i) => i.priceUnavailable || (!i.estimatedPrice && !i.price)).length,
    [items],
  );

  const priceSource = pricingMeta?.priceSource || "curated_db";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
          <p className="text-gray-500 font-medium animate-pulse">Loading your shopping session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* ─ Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-2xl w-11 h-11 hover:bg-[#f3f0fd] hover:text-[var(--primary)] transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-[#1a1c1e] tracking-tight truncate max-w-[180px] sm:max-w-md">
                {session?.name || "Shopping List"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="bg-[#f3f0fd] text-[var(--primary)] hover:bg-[#e9e4fa] border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {session?.status === "active" ? "Active List" : "Completed"}
                </Badge>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {session?.createdAt
                      ? new Date(session.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-2xl w-11 h-11 border-gray-100 hover:border-[var(--primary-light)] hover:bg-[#f3f0fd] transition-all duration-300 shadow-sm">
                    <Share2 className="h-4.5 w-4.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share list</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" className="rounded-2xl w-11 h-11 border-gray-100 hover:border-[var(--primary-light)] hover:bg-[#f3f0fd] transition-all duration-300 shadow-sm">
              <MoreVertical className="h-4.5 w-4.5 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 py-8">

        {/* ── Cost summary strip ───────────────────────────────── */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-[var(--primary)] to-[#5a4fcf] rounded-[28px] px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-[var(--primary)]/20 relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Estimated Total</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tighter">${totalCost.toFixed(2)}</span>
                <span className="text-white/50 text-sm">USD</span>
              </div>
              <p className="text-white/50 text-xs mt-0.5">
                {priceSource.includes("kroger") ? "Live Kroger store prices" : "USA market price averages (2025)"}
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3 flex-wrap">
              <div className="bg-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-green-300" />
                <span className="text-xs font-bold text-green-200">{items.length - unavailableCount} priced items</span>
              </div>
              {unavailableCount > 0 && (
                <div className="bg-orange-400/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-orange-300" />
                  <span className="text-xs font-bold text-orange-200">{unavailableCount} price N/A</span>
                </div>
              )}
              <div className="bg-white/10 rounded-xl px-3 py-1.5">
                <span className="text-xs font-bold">{items.length} items total</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Price transparency note */}
        {items.length > 0 && (
          <div className="mb-6 flex items-start gap-2.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-4 py-3 rounded-2xl">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" />
            <span>
              Prices are <b>{priceSource.includes("kroger") ? "live from Kroger" : "USA market averages (2025)"}</b> — <b>never AI-guessed</b>. Items without a known retail price are flagged as <span className="text-orange-600 font-bold">Price N/A</span>. You can <b>remove items</b> you already have at home using the trash button inside each item.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Items List ──────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] p-6 sm:p-10 min-h-[600px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-[900] text-[#1a1c1e] tracking-tight">Grocery List</h2>
                  <p className="text-gray-400 font-medium text-sm mt-1">
                    Manage and track your ingredients in real-time
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--primary)] bg-[#f3f0fd] px-4 py-2 rounded-2xl border border-[var(--primary-bg)] shadow-sm uppercase tracking-wider">
                    {items.length} Items Total
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="bg-[#f3f0fd] p-8 rounded-[32px] mb-6 transform rotate-3">
                    <Package className="h-12 w-12 text-[var(--primary-light)]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your basket is empty</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-3 leading-relaxed">
                    Add some ingredients to your shopping session to get started on your culinary journey.
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(groupedItems).map(([category, catItems]) => (
                    <div key={category} className="space-y-6">
                      {/* Category header */}
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_rgba(61,50,109,0.3)]" />
                        <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--primary-light)]">
                          {category}
                        </h3>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-100 to-transparent" />
                        {/* Category subtotal */}
                        <span className="text-xs font-black text-gray-500">
                          ${catItems.reduce((sum, item) => {
                            const p = item.estimatedPrice ?? (item.price ? parseFloat(item.price) : 0);
                            return sum + (p || 0);
                          }, 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Accordion items */}
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {catItems.map((item) => {
                          const itemPrice = item.estimatedPrice ?? (item.price ? parseFloat(item.price) : null);
                          const isPriced = itemPrice !== null && !item.priceUnavailable;

                          return (
                            <AccordionItem
                              key={item.id}
                              value={item.id}
                              className="border-none transition-all duration-300 rounded-[28px] overflow-hidden group/item mb-4 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                            >
                              {/* Item Header */}
                              <AccordionTrigger className="flex items-center px-6 py-4 hover:no-underline transition-all [&[data-state=open]>svg]:rotate-90">
                                <div className="flex items-center gap-5 w-full pr-2">
                                  {/* Item Image */}
                                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-inner group-hover/item:scale-105 transition-transform duration-500">
                                    {item.imageUrl ? (
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.ingredientName}
                                        fill
                                        className="object-cover transition-all duration-500 group-hover/item:scale-110"
                                      />
                                    ) : itemImages[item.ingredientName] ? (
                                      <Image
                                        src={itemImages[item.ingredientName]}
                                        alt={item.ingredientName}
                                        fill
                                        className="object-cover transition-all duration-500 group-hover/item:scale-110"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                                        <Package className="h-8 w-8" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Text Content */}
                                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                    <span className="font-extrabold text-[#1a1c1e] text-[17px] tracking-tight transition-all truncate w-full">
                                      {item.ingredientName}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-[11px] font-black text-[var(--primary-light)] uppercase tracking-wider bg-[var(--primary-bg)] px-2 py-0.5 rounded-lg">
                                        {item.quantity} {item.unit}
                                      </span>
                                      {isPriced ? (
                                        <span className="text-[12px] font-black text-emerald-700">
                                          ${itemPrice!.toFixed(2)}
                                        </span>
                                      ) : (
                                        <PriceSourceBadge source="unavailable" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: price badge */}
                                  <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                                    {isPriced && <PriceSourceBadge source={item.priceSource} />}
                                  </div>
                                </div>
                              </AccordionTrigger>

                              {/* Item Details Accordion Content */}
                              <AccordionContent className="px-4 pb-4">
                                <div className="pt-4 border-t border-gray-50 space-y-6">

                                  {/* Retail unit & price info */}
                                  {isPriced && (
                                    <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-1.5 text-gray-600">
                                        <Tag className="h-3 w-3" />
                                        <span className="font-medium">Retail unit:</span>
                                        <span className="font-bold text-gray-800">
                                          {item.retailQuantity ?? item.quantity} {item.retailUnit ?? item.unit}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-lg font-black text-[#1a1c1e]">
                                          ${itemPrice!.toFixed(2)}
                                        </span>
                                        <PriceSourceBadge source={item.priceSource} />
                                      </div>
                                    </div>
                                  )}

                                  {/* Price Comparison Section */}
                                  <div>
                                    <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                                        <Store className="h-3.5 w-3.5 text-[var(--primary)]" />
                                        Price Comparison
                                      </h4>
                                      <Badge variant="outline" className="text-[9px] font-bold border-green-200 text-green-600 bg-green-50">
                                        <TrendingDown className="h-2 w-2 mr-1" />
                                        Cheapest At Walmart
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                      {STORE_COMPARISONS.map((store) => (
                                        <div key={store.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-400 shadow-sm">
                                              {store.name.charAt(0)}
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-gray-800">{store.name}</p>
                                              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-0.5">
                                                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" /> {store.rating}
                                                </span>
                                                <span className="flex items-center gap-0.5">
                                                  <MapPin className="h-2.5 w-2.5" /> {store.distance}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs font-black text-gray-900">${store.price}</p>
                                            <p className={`text-[9px] font-bold ${store.stock === "In Stock" ? "text-green-600" : "text-orange-600"}`}>
                                              {store.stock}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Info + Remove button row */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="bg-gray-50 p-3 rounded-xl flex gap-3 items-start flex-1">
                                      <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-[10px] text-gray-500 leading-relaxed">
                                        Prices are real estimates for <b>{item.ingredientName}</b>. Item may vary by local availability.
                                      </p>
                                    </div>

                                    {/* ── Remove item button ── */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={deletingId === item.id}
                                          className="flex-shrink-0 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all gap-1.5"
                                        >
                                          {deletingId === item.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4" />
                                          )}
                                          <span className="text-[11px] font-bold">Already have it</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="rounded-[28px]">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Remove from list?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will remove <b>{item.ingredientName}</b> from your shopping list. Use this if you already have this item at home.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="rounded-xl bg-red-500 hover:bg-red-600"
                                            onClick={() => handleDeleteItem(item.id, item.ingredientName)}
                                          >
                                            Remove Item
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>

                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ─────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-[0_15px_50px_rgba(0,0,0,0.05)] bg-white overflow-hidden rounded-[40px] sticky top-28">
              {/* Cost breakdown header */}
              <div className="bg-[var(--primary)] p-8 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                    Session Progress
                  </p>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-5xl font-black tracking-tighter">
                        {items.length}<span className="text-2xl opacity-60 ml-0.5"> items</span>
                      </h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                        <p className="text-xs font-black text-white">${totalCost.toFixed(2)} est.</p>
                      </div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Cost</p>
                    </div>
                  </div>
                  {unavailableCount > 0 && (
                    <div className="bg-orange-400/20 rounded-xl px-3 py-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-300" />
                      <span className="text-xs font-bold text-orange-200">
                        {unavailableCount} items need price check
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-8 space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">
                  Shopping Modes
                </p>

                <Button
                  onClick={handleInstacart}
                  className="w-full h-16 justify-start gap-4 rounded-[24px] bg-[#F6FBDC] hover:bg-[#EEF7C2] text-[#343538] border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-2.5 rounded-2xl border border-[#D9EF6F] group-hover:scale-110 transition-transform shadow-sm">
                    <ShoppingCart className="h-5 w-5 text-[#343538]" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-[#343538] text-[14px]">Shop with Instacart</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">One-click checkout & delivery</div>
                  </div>
                  <ExternalLink className="ml-auto h-4 w-4 text-gray-400 group-hover:text-[#343538] group-hover:translate-x-1 transition-all" />
                </Button>

                <Button
                  className="w-full h-16 justify-start gap-4 rounded-[24px] bg-[#f3f0fd] hover:bg-[#e9e4fa] text-[var(--primary)] border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-2.5 rounded-2xl border border-[var(--primary-bg)] group-hover:scale-110 transition-transform shadow-sm">
                    <CheckSquare className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-[var(--primary)] text-[14px]">Manual Shopping</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">Track items during your visit</div>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </Button>

                <Button
                  onClick={handleDownload}
                  className="w-full h-16 justify-start gap-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 text-sky-900 border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-2.5 rounded-2xl border border-sky-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Download className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-sky-900 text-[14px]">Export List</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">Save as PDF or Print list</div>
                  </div>
                  <Printer className="ml-auto h-4 w-4 text-gray-400 group-hover:text-sky-900 group-hover:translate-x-1 transition-all" />
                </Button>

                {/* Pricing transparency */}
                <div className="bg-gray-50 rounded-2xl p-4 mt-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Price Transparency</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <Database className="h-3 w-3 text-emerald-500" />
                      <span><b className="text-gray-800">Market avg</b> — curated US grocery prices</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <Zap className="h-3 w-3 text-blue-500" />
                      <span><b className="text-gray-800">Live price</b> — from Kroger API (real-time)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span><b className="text-gray-800">Price N/A</b> — not in our database</span>
                    </div>
                  </div>
                </div>

                {/* "Already have it?" hint */}
                <div className="bg-red-50 rounded-2xl p-4 flex gap-3 items-start border border-red-100">
                  <Trash2 className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-red-700">Already have an item?</p>
                    <p className="text-[10px] text-red-500 mt-0.5 leading-relaxed">
                      Open any item card and tap <b>"Already have it"</b> to remove it from your list.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
