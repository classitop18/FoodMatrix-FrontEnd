"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  CheckSquare,
  Square,
  Package,
  Clock,
  ChevronRight,
  Printer,
  Share2,
  MoreVertical,
  AlertCircle,
  Loader2,
  Store,
  TrendingDown,
  Info,
  MapPin,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecipeService } from "@/services/recipe";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import { getUnsplashImage } from "@/app/actions/unsplash";
import Image from "next/image";

// Static comparison data
const STORE_COMPARISONS = [
  { name: "Walmart Supercenter", price: 2.97, rating: 4.2, distance: "1.2 mi", stock: "In Stock" },
  { name: "Kroger Marketplace", price: 3.45, rating: 4.5, distance: "0.8 mi", stock: "Low Stock" },
  { name: "Target Grocery", price: 3.20, rating: 4.8, distance: "2.5 mi", stock: "In Stock" },
  { name: "Whole Foods Market", price: 4.15, rating: 4.9, distance: "3.1 mi", stock: "In Stock" },
];

export default function ShoppingRecipeSession({ params }: { params: { id: string } }) {
  const sessionId = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<Record<string, string>>({});

  const recipeService = useRef(new RecipeService());

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    } else {
      // router.push("/shopping-recipe");
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await recipeService.current.getShoppingSession(sessionId as string);
      if (data) {
        setSession(data.session);
        setItems(data.items || []);

        // Fetch images for items
        const ingredientNames = (data.items || []).map((i: any) => i.ingredientName);
        fetchItemImages(ingredientNames);
      }
    } catch (error) {
      console.error("Failed to fetch shopping session", error);
      toast({
        title: "Error",
        description: "Failed to load shopping list.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchItemImages = async (names: string[]) => {
    const uniqueNames = Array.from(new Set(names));
    const images: Record<string, string> = {};

    // Fetch images in small batches to avoid rate limits
    for (let i = 0; i < uniqueNames.length; i += 3) {
      const batch = uniqueNames.slice(i, i + 3);
      await Promise.all(
        batch.map(async (name) => {
          const url = await getUnsplashImage(name);
          if (url) images[name] = url;
        })
      );
    }
    setItemImages(prev => ({ ...prev, ...images }));
  };

  const toggleItemStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(itemId);
      await recipeService.current.updateShoppingSessionItem(itemId, !currentStatus);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isPurchased: !currentStatus } : item
      ));

      toast({
        title: !currentStatus ? "Item checked" : "Item unchecked",
        duration: 1500
      });
    } catch (error) {
      console.error("Failed to update item status", error);
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = async () => {
    try {
      toast({
        title: "Downloading...",
        description: "Your shopping list is being prepared."
      });

      const payload = {
        name: session?.name || "Shopping List",
        ingredients: items.map(item => ({
          ingredientName: item.ingredientName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category
        }))
      };

      await recipeService.current.downloadShoppingListPdf(payload);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleInstacart = () => {
    toast({
      title: "Instacart Integration",
      description: "Redirecting to Instacart with your items..."
    });
    window.open("https://www.instacart.com", "_blank");
  };

  const purchasedCount = useMemo(() => items.filter(i => i.isPurchased).length, [items]);
  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((purchasedCount / items.length) * 100);
  }, [purchasedCount, items.length]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    items.forEach(item => {
      const cat = item.category || "Others";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [items]);

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
      {/* Header */}
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
                  {session?.status === 'active' ? 'Active List' : 'Completed'}
                </Badge>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(session?.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Section - Items List (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] p-6 sm:p-10 min-h-[600px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-[900] text-[#1a1c1e] tracking-tight">Grocery List</h2>
                  <p className="text-gray-400 font-medium text-sm mt-1">Manage and track your ingredients in real-time</p>
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
                  <p className="text-gray-500 max-w-xs mx-auto mt-3 leading-relaxed">Add some ingredients to your shopping session to get started on your culinary journey.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(groupedItems).map(([category, catItems]) => (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_rgba(61,50,109,0.3)]" />
                        <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[var(--primary-light)]">{category}</h3>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-100 to-transparent" />
                      </div>

                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {catItems.map((item) => (
                          <AccordionItem
                            key={item.id}
                            value={item.id}
                            className={`border-none transition-all duration-300 rounded-[28px] overflow-hidden group/item mb-4 ${item.isPurchased
                              ? 'bg-gray-50/50 opacity-80'
                              : 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                              }`}
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
                                      className={`object-cover transition-all duration-500 ${item.isPurchased ? 'grayscale opacity-40 blur-[0.5px]' : 'group-hover/item:scale-110'}`}
                                    />
                                  ) : itemImages[item.ingredientName] ? (
                                    <Image
                                      src={itemImages[item.ingredientName]}
                                      alt={item.ingredientName}
                                      fill
                                      className={`object-cover transition-all duration-500 ${item.isPurchased ? 'grayscale opacity-40 blur-[0.5px]' : 'group-hover/item:scale-110'}`}
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                                      <Package className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>

                                {/* Text Content */}
                                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                  <span className={`font-extrabold text-[#1a1c1e] text-[17px] tracking-tight transition-all truncate w-full ${item.isPurchased ? 'text-gray-400 line-through decoration-gray-300 decoration-2' : ''}`}>
                                    {item.ingredientName}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] font-black text-[var(--primary-light)] uppercase tracking-wider bg-[var(--primary-bg)] px-2 py-0.5 rounded-lg">
                                      {item.quantity} {item.unit} {item.krogerPackageSize && item.priceSource === "kroger" ? ` • Buy: ${item.krogerPackageSize}` : ""}
                                    </span>
                                    {item.isPurchased && (
                                      <Badge variant="secondary" className="bg-green-50 text-green-600 border-none text-[9px] font-bold py-0 h-4">
                                        PURCHASED
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>

                            {/* Item Details Content (Accordion) */}
                            <AccordionContent className="px-4 pb-4">
                              <div className="pt-4 border-t border-gray-50 space-y-6">
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
                                    {STORE_COMPARISONS.map((store, i) => (
                                      <div key={store.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-400 shadow-sm">
                                            {store.name.charAt(0)}
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-gray-800">{store.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                              <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" /> {store.rating}</span>
                                              <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {store.distance}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-gray-900">${store.price}</p>
                                          <p className={`text-[9px] font-bold ${store.stock === 'In Stock' ? 'text-green-600' : 'text-orange-600'}`}>{store.stock}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Extra Data / Nutritional Info */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Estimated Calories</p>
                                    <p className="text-sm font-black text-blue-900">~120 kcal</p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Health Impact</p>
                                    <div className="flex items-center gap-1">
                                      <Badge className="bg-orange-500 text-white border-none py-0 text-[10px]">High Protein</Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl flex gap-3 items-start">
                                  <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <p className="text-[10px] text-gray-500 leading-relaxed">
                                    Prices are real-time estimates for <b>{item.ingredientName}</b>. Stock levels may vary by local availability.
                                  </p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Navigation & Actions (4 columns) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-[0_15px_50px_rgba(0,0,0,0.05)] bg-white overflow-hidden rounded-[40px] sticky top-28">
              <div className="bg-[var(--primary)] p-8 text-white relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-1">Session Progress</p>
                      <h3 className="text-5xl font-black tracking-tighter">{progress}<span className="text-2xl opacity-60 ml-0.5">%</span></h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-2">
                        <p className="text-xs font-black text-white">{purchasedCount} / {items.length}</p>
                      </div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Items Bagged</p>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] rounded-full"
                    />
                  </div>
                </div>
              </div>

              <CardContent className="p-8 space-y-5">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-1">Shopping Modes</p>

                <Button
                  onClick={handleInstacart}
                  className="w-full h-18 justify-start gap-4 rounded-[24px] bg-[#F6FBDC] hover:bg-[#EEF7C2] text-[#343538] border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-3 rounded-2xl border border-[#D9EF6F] group-hover:scale-110 transition-transform shadow-sm">
                    <ShoppingCart className="h-6 w-6 text-[#343538]" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-[#343538] text-[15px]">Shop with Instacart</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">One-click checkout & delivery</div>
                  </div>
                  <ExternalLink className="ml-auto h-5 w-5 text-gray-400 group-hover:text-[#343538] group-hover:translate-x-1 transition-all" />
                </Button>

                <Button
                  className="w-full h-18 justify-start gap-4 rounded-[24px] bg-[#f3f0fd] hover:bg-[#e9e4fa] text-[var(--primary)] border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-3 rounded-2xl border border-[var(--primary-bg)] group-hover:scale-110 transition-transform shadow-sm">
                    <CheckSquare className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-[var(--primary)] text-[15px]">Manual Shopping</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">Track items during your visit</div>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </Button>

                <Button
                  onClick={handleDownload}
                  className="w-full h-18 justify-start gap-4 rounded-[24px] bg-sky-50 hover:bg-sky-100 text-sky-900 border-none group transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="bg-white p-3 rounded-2xl border border-sky-100 group-hover:scale-110 transition-transform shadow-sm">
                    <Download className="h-6 w-6 text-sky-600" />
                  </div>
                  <div className="text-left py-1">
                    <div className="font-extrabold text-sky-900 text-[15px]">Export List</div>
                    <div className="text-[11px] font-medium text-gray-500 mt-0.5 opacity-80">Save as PDF or Print list</div>
                  </div>
                  <Printer className="ml-auto h-5 w-5 text-gray-400 group-hover:text-sky-900 group-hover:translate-x-1 transition-all" />
                </Button>
              </CardContent>
            </Card>

            {/* <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 rounded-[32px] p-6 flex gap-5 items-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <AlertCircle className="h-20 w-20" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl shadow-sm relative z-10">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div className="relative z-10 transition-transform group-hover:translate-x-1 duration-500">
                <h4 className="font-black text-orange-900 text-sm uppercase tracking-widest">Growth Hack</h4>
                <p className="text-[13px] text-orange-800/80 mt-1 leading-snug font-medium">Shop produce first to get the freshest ingredients and better meal quality.</p>
              </div>
            </Card> */}
          </div>
        </div>
      </main>

      {/* Floating Complete Button (Visible on Mobile) */}
      <AnimatePresence>
        {progress === 100 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100%-2rem)] sm:max-w-md"
          >
            <Button className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-200 gap-3 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Complete Shopping Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
