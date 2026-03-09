"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, Info, HelpCircle, Phone, LogIn, UserPlus, ChefHat } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { Button as UiButton } from "@/components/ui/button";

import Button from "./buttons/black-button";
import BorderButton from "./buttons/border-button";

const publicLinks = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/", icon: Info, label: "About Us" },
  { path: "/", icon: HelpCircle, label: "Why Food Matrix" },
  { path: "/", icon: Phone, label: "Contact" },
  { path: "/login", icon: LogIn, label: "Login" },
  { path: "/register", icon: UserPlus, label: "Create Account" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 py-2 h-20 bg-white shadow-[0_4px_10px_rgba(225,221,240,1)] flex items-center z-50">
      <div className="w-full lg:w-5xl xl:w-[1320px] mx-auto px-6 relative flex justify-between items-center">
        {/* ---------- LOGO ---------- */}
        <Link href={"/"} className="flex flex-col leading-tight cursor-pointer">
          <Image src={logo} width={190} height={50} alt="Logo Here" />
        </Link>

        {/* ---------- RIGHT SIDE ---------- */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* ---- Nav links ---- */}
          <ul className="gap-6 text-gray-300 hidden lg:flex items-center">
            <li className="relative group">
              <Link
                href="/"
                className={
                  "text-(--primary) block text-base leading-[22px] font-medium transition-colors duration-200"
                }
              >
                Home
              </Link>
            </li>

            <li className="relative group">
              <Link
                href="/"
                className={
                  "text-black block text-base leading-[22px] font-medium transition-colors duration-200"
                }
              >
                About Us
              </Link>
            </li>

            <li className="relative group">
              <Link
                href="/"
                className={
                  "text-black block text-base leading-[22px] font-medium transition-colors duration-200"
                }
              >
                Why Food Matrix
              </Link>
            </li>

            <li className="relative group">
              <Link
                href="/"
                className={
                  "text-black block text-base leading-[22px] font-medium transition-colors duration-200"
                }
              >
                Contact
              </Link>
            </li>

            <li className="relative group">
              <Link
                href="/"
                className={
                  "text-black block text-base leading-[22px] font-medium transition-colors duration-200"
                }
              >
                Contact
              </Link>
            </li>
            <li className="relative group cursor-pointer">
              <Link href={"/login"} className="cursor-pointer">
                <Button label="Login" />
              </Link>
            </li>
            <li className="relative group cursor-pointer">
              <Link href={"/register"}>
                <BorderButton label="Create Account" />
              </Link>
            </li>
          </ul>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="block lg:hidden p-0! border-none bg-(--primary) size-10 flex items-center justify-center rounded-md">
                <Menu className="text-white size-6" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="p-0 w-[280px] border-r-0 bg-transparent shadow-none"
            >
              <aside className="h-full bg-white flex flex-col pt-[55px] shadow-2xl rounded-r-2xl">
                {/* Logo */}
                <div className="p-4 border-b border-[#EBE7F6] flex items-center justify-between bg-white w-[280px] absolute top-0 left-0 rounded-tr-2xl">
                  <div
                    className="flex items-center gap-3 overflow-hidden cursor-pointer"
                    onClick={() => {
                      router.push("/");
                      setOpen(false);
                    }}
                  >
                    <div className="min-w-10 w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
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
                </div>

                <div className="flex flex-col h-full bg-white transition-all duration-300 overflow-y-auto">
                  <div className="px-4 py-6">
                    <nav className="flex flex-col gap-2 space-y-2">
                      {publicLinks.map((item) => (
                        <UiButton
                          key={item.label}
                          variant="ghost"
                          className="w-full gap-3 transition-all duration-300 relative overflow-hidden group mb-0 cursor-pointer justify-start h-11 text-gray-600 hover:bg-[var(--primary-bg)] hover:text-[var(--primary)]"
                          onClick={() => {
                            router.push(item.path);
                            setOpen(false);
                          }}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          <span className="truncate font-medium">{item.label}</span>
                        </UiButton>
                      ))}
                    </nav>
                  </div>
                </div>
              </aside>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
