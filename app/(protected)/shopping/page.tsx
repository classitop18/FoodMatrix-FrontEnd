"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Store,
  ExternalLink,
  X,
  ShoppingBag,
  Truck,
  Clock,
  Info,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StoreData {
  id: string;
  name: string;
  domain: string;
  color: string;
  description: string;
  deliveryOptions: string[];
  matchRate: number;
}

const STORES: StoreData[] = [
  {
    id: "walmart",
    name: "Walmart",
    domain: "walmart.com",
    color: "#0071CE",
    description: "Everyday low prices on groceries and more.",
    deliveryOptions: ["Same-day Delivery", "Curbside Pickup", "In-Store"],
    matchRate: 98,
  },
  {
    id: "heb",
    name: "H-E-B",
    domain: "heb.com",
    color: "#E2231A",
    description: "Here Everything's Better. Fresh local produce and meats.",
    deliveryOptions: ["Curbside Pickup", "Home Delivery"],
    matchRate: 95,
  },
  {
    id: "target",
    name: "Target",
    domain: "target.com",
    color: "#CC0000",
    description: "Expect More. Pay Less. Premium groceries and essentials.",
    deliveryOptions: ["Same-day Delivery", "Order Pickup", "Drive Up"],
    matchRate: 92,
  },
  {
    id: "wholefoods",
    name: "Whole Foods",
    domain: "wholefoodsmarket.com",
    color: "#00674b",
    description: "America's Healthiest Grocery Store.",
    deliveryOptions: ["2-Hour Delivery", "Pickup", "In-Store"],
    matchRate: 88,
  },
  {
    id: "kroger",
    name: "Kroger",
    domain: "kroger.com",
    color: "#005baa",
    description: "Fresh for Everyone.",
    deliveryOptions: ["Delivery", "Pickup", "Shipping"],
    matchRate: 85,
  },
  {
    id: "aldi",
    name: "ALDI",
    domain: "aldi.us",
    color: "#003b7e",
    description: "High quality groceries at incredibly low prices.",
    deliveryOptions: ["Delivery", "Curbside Pickup"],
    matchRate: 90,
  },
  {
    id: "costco",
    name: "Costco",
    domain: "costco.com",
    color: "#E31837",
    description: "Wholesale prices on premium bulk groceries.",
    deliveryOptions: ["Same-Day Delivery", "2-Day Delivery"],
    matchRate: 82,
  },
  {
    id: "safeway",
    name: "Safeway",
    domain: "safeway.com",
    color: "#E11322",
    description: "Ingredients for life.",
    deliveryOptions: ["Delivery", "Drive Up & Go"],
    matchRate: 79,
  }
];

export default function ShoppingPage() {
  const [zipCode, setZipCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode || zipCode.length < 5) return;

    setIsSearching(true);
    // Simulate API search call
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#7661d3]/10 to-transparent rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#7dab4f]/10 to-transparent rounded-full -ml-20 -mb-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10 flex-col flex w-full">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-sm font-bold text-[#7661d3] mb-4">
            <ShoppingBag className="w-4 h-4" />
            Online Grocery Shopping
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#313131] tracking-tight mb-4">
            Shop Your Ingredients
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Enter your zip code to find the best online grocery stores delivering to your area.
          </p>
        </div>

        {/* Search Bar */}
        {/* <motion.div
          className="max-w-xl mx-auto w-full mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7661d3] to-[#7dab4f] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex items-center gap-2">
              <div className="pl-4 text-gray-400">
                <MapPin className="w-6 h-6" />
              </div>
              <Input
                type="text"
                placeholder="Enter 5-digit ZIP code (e.g. 78701)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="border-none shadow-none text-lg font-medium focus-visible:ring-0 px-2 placeholder:text-gray-300 h-14"
              />
              <Button
                type="submit"
                disabled={isSearching || zipCode.length < 5}
                className="h-14 px-8 rounded-xl bg-[#313131] hover:bg-black text-white font-bold shadow-md transition-all text-base"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Find Stores
                  </div>
                )}
              </Button>
            </div>
          </form>
        </motion.div> */}

        {/* Results */}
        <AnimatePresence mode="wait">
          {true && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#313131] flex items-center gap-2">
                  <Store className="w-6 h-6 text-[#7dab4f]" />
                  Stores delivering to {zipCode}
                </h2>
                <Badge variant="outline" className="text-gray-500 bg-white border-gray-200 px-3 py-1 font-bold">
                  {STORES.length} stores found
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STORES.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedStore(store)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundColor: store.color }}
                    />

                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 p-2 shadow-sm group-hover:shadow-md transition-all bg-white relative overflow-hidden">
                        {/* Using logo.clearbit.com for excellent brand logos */}
                        <img
                          src={`https://logo.clearbit.com/${store.domain}`}
                          alt={`${store.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback if logo fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `<span style="color:${store.color}; font-weight:900; font-size:1.2rem;">${store.name.charAt(0)}</span>`;
                          }}
                        />
                      </div>
                      <Badge className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 font-bold">
                        {store.matchRate}% Match
                      </Badge>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#313131] mb-2">{store.name}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-6 flex-grow">{store.description}</p>

                    <div className="space-y-2 mb-6">
                      {store.deliveryOptions.slice(0, 2).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                          {opt.includes('Delivery') ? <Truck className="w-3.5 h-3.5 text-[#7661d3]" /> : <Clock className="w-3.5 h-3.5 text-[#7dab4f]" />}
                          {opt}
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full mt-auto bg-gray-50 hover:bg-[var(--primary)] text-[#313131] hover:text-white border border-gray-200 hover:border-transparent font-bold transition-all group-hover:bg-[#3d326d] group-hover:text-white group-hover:shadow-md"
                    >
                      Shop Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Webview / Iframe Modal */}
      <AnimatePresence>
        {selectedStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-[1400px] h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
            >
              {/* Browser Header */}
              <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-sm font-medium text-gray-500 w-[300px] lg:w-[500px]">
                    <div className="w-4 h-4 mr-2" style={{ color: selectedStore.color }}>
                      <Store className="w-full h-full" />
                    </div>
                    https://www.{selectedStore.domain}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 rounded-xl border-gray-200 text-gray-600 hover:text-[#3d326d] font-bold"
                    onClick={() => window.open(`https://www.${selectedStore.domain}`, '_blank')}
                  >
                    Open in browser
                    <ExternalLink className="w-4 h-4" />
                  </Button> */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => setSelectedStore(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Iframe Warning (for domains that block iframes) */}
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start sm:items-center gap-3 text-amber-800 text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                <p>
                  Some retailers block their websites from loading inside other apps. If the page below is blank or fails to load, please
                  <a href={`https://www.${selectedStore.domain}`} target="_blank" rel="noreferrer" className="underline font-bold mx-1 hover:text-amber-900">
                    click here to open {selectedStore.name} in a new tab
                  </a>
                  securely.
                </p>
              </div>

              {/* Webview Content */}
              <div className="flex-1 w-full relative bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-10 h-10 border-4 border-[#3d326d] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-bold">Connecting to {selectedStore.name}...</p>
                </div>

                <iframe
                  src={`https://www.${selectedStore.domain}`}
                  className="absolute inset-0 w-full h-full border-none z-10 bg-white"
                  title={`${selectedStore.name} Shop`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
