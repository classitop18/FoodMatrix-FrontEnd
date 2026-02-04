"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Home,
  ChefHat,
  BookOpen,
  ShoppingCart,
  Receipt,
  CreditCard,
  TrendingUp,
  Award,
  Mic,
  Users,
  Heart,
  MapPin,
  LogOut,
  Menu,
  Store,
  Copy,
  Activity,
  MessageCircle,
  Wrench,
  MenuIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLogout } from "@/services/auth/auth.mutation";
import Loader from "./common/Loader";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems = [
  {
    section: "Main",
    items: [
      { path: "/dashboard", icon: Home, label: "Dashboard" },
      { path: "/meal-planning", icon: ChefHat, label: "Meal Planning" },
      { path: "/pantry", icon: Store, label: "Pantry" },
      { path: "/recipes", icon: BookOpen, label: "Recipes" },
      { path: "/shopping", icon: ShoppingCart, label: "Shopping" },
      { path: "/history", icon: Receipt, label: "History" },
    ],
  },
  {
    section: "Features",
    items: [
      {
        path: "/meal-intelligence",
        icon: TrendingUp,
        label: "Meal Intelligence",
      },
      { path: "/rewards", icon: Award, label: "Rewards" },
      { path: "/voice-assistant", icon: Mic, label: "Voice Assistant" },
      { path: "/event-meal-plan/list", icon: BookOpen, label: "Event Meal Plans" }
    ],
  },
  {
    section: "Settings",
    items: [
      { path: "/profile", icon: Users, label: "Profile" },
      { path: "/account", icon: Wrench, label: "Account" },
      { path: "/notifications", icon: MessageCircle, label: "Notifications" },
      { path: "/audit", icon: Copy, label: "Audit" },
      { path: "/activity", icon: Activity, label: "Activity" },
      { path: "/health-optimization", icon: Heart, label: "Health" },
      { path: "/location", icon: MapPin, label: "Location" },
      { path: "/subscription", icon: CreditCard, label: "Subscription" },
    ],
  },
];

export function Sidebar({ className, onNavigate }: SidebarProps) {
  // HOOKS
  const logoutMutation = useLogout();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleNavigation = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  const [collapsed, setCollapsed] = useState(false);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
  };

  const handleLogout = async () => {
    // TODO: Integrate logout API
    await logoutMutation.mutateAsync();
    localStorage.clear();
    sessionStorage.clear();

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    if (path === "/shopping") {
      return pathname.startsWith("/shopping") || pathname.startsWith("/store");
    }
    if (path === "/meal-planning") {
      return (
        pathname === "/meal-planning" ||
        pathname.includes("recipe-selection") ||
        pathname.includes("takeout-selection")
      );
    }
    if (path === "/health-optimization") {
      return (
        pathname === "/health-optimization" || pathname === "/food-preferences"
      );
    }
    return pathname === path;
  };

  const NavButton = ({ item, active }: any) => {
    const button = (
      <Button
        variant="ghost"
        className={cn(
          "w-full gap-3 transition-all duration-300 relative overflow-hidden group mb-0 cursor-pointer justify-start h-11",
          active
            ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30 hover:bg-[var(--primary)]/90"
            : "text-gray-600 hover:bg-[var(--primary-bg)] hover:text-[var(--primary)]",
        )}
        onClick={() => handleNavigation(item.path)}
      >
        <item.icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform duration-300",
            active ? "text-white scale-110" : "group-hover:scale-110",
          )}
        />
        <span
          className={cn("truncate font-medium", active ? "text-white" : "")}
        >
          {item.label}
        </span>
        {active && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--green)] rounded-l-full"></div>
        )}
      </Button>
    );

    return button;
  };

  if (logoutMutation?.isPending) {
    return <Loader />;
  }

  return (
    <>
      {/* Sidebar (fixed height, no scroll) */}
      <aside
        className={cn(
          "h-screen bg-white flex-shrink-0 transition-all duration-300 pt-[55px] fixed z-[51] lg:relative",
          collapsed ? "-left-[266px] w-0" : "left-0 w-64",
        )}
      >
        {/* Logo */}
        <div className="p-2 border-b border-[#EBE7F6] flex items-center justify-betweenbg-white fixed top-0 left-0 w-[256px] justify-between">
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="min-w-10 w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              {/* Using ChefHat as a placeholder logo icon if UtensilsCrossed is not desired, but sticking to existing icon with better style */}
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-[#3D326D] tracking-tight leading-none">
                FoodMatrix
              </h1>
              <p className="text-[10px] text-[var(--green)] font-bold uppercase tracking-wider mt-1">
                Budget Intelligence
              </p>
            </div>
          </div>

          {handleToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCollapse}
              className="text-gray-400 hover:text-[var(--primary)] bg-[var(--primary-bg)] rounded-full w-8 h-8"
            >
              {collapsed ? (
                <MenuIcon className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col h-full bg-white  border-[#EBE7F6] transition-all duration-300 scrollbar-hide shadow-2xl md:shadow-none",
          )}
        >
          {/* Navigation */}
          {/* Navigation */}
          <ScrollArea className="px-4 py-6 h-[calc(100vh-138px)] overflow-y-auto">
            {navigationItems.map((section) => (
              <div
                key={section.section}
                className="mb-4 last:mb-0 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <h2 className="px-3 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {section.section}
                </h2>
                <nav className="flex flex-col gap-2 space-y-2">
                  {section.items.map((item) => (
                    <NavButton
                      key={item.path}
                      item={item}
                      active={isActive(item.path)}
                    />
                  ))}
                </nav>
              </div>
            ))}
          </ScrollArea>

          {/* Logout */}
          <div className="p-4 border-t border-[#EBE7F6] bg-gray-50/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 bg-red-50 hover:text-red-600 transition-colors h-12 rounded-lg cursor-pointer"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  const handleNavigate = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[var(--primary)] hover:bg-[var(--primary-bg)]"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="p-0 w-[280px] border-r-0 bg-transparent shadow-none"
      >
        {/* Render sidebar directly with styling handled internally */}
        <Sidebar
          onNavigate={handleNavigate}
          className="h-full rounded-r-2xl shadow-2xl"
        />
      </SheetContent>
    </Sheet>
  );
}
