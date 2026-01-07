import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";

import Button from "./buttons/black-button";
import BorderButton from "./buttons/border-button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 py-2 h-20 bg-white shadow-[0_4px_10px_rgba(225,221,240,1)] flex items-center">
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
            <li className="relative group">
              <Link href={"/login"}>
                <Button label="Login" />
              </Link>
            </li>
            <li className="relative group">
              <Link href={"/register"}>
                <BorderButton label="Create Account" />
              </Link>
            </li>
          </ul>

          <Drawer direction="left">
            <DrawerTrigger asChild className="block lg:hidden">
              <button className="p-0! border-none bg-(--primary) size-10 flex items-center justify-center rounded-md">
                <Menu className="text-white size-6" />
              </button>
            </DrawerTrigger>

            <DrawerContent className="bg-white max-w-72">
              <div className="mx-auto w-full p-4">
                <Link
                  href={"/"}
                  className="flex flex-col leading-tight cursor-pointer"
                >
                  <h1 className="text-black text-[38px] font-bold tracking-wide">
                    BRD
                  </h1>
                  <span className="text-black text-[14px] -mt-3 font-light tracking-wide">
                    Associates
                  </span>
                </Link>
                {/* ---- Nav links ---- */}
                <ul className="gap-6 text-gray-300 hidden lg:flex">
                  <li className="relative group">
                    <Link
                      href="/"
                      className={
                        "text-white block text-base leading-[22px] font-normal transition-colors duration-200"
                      }
                    >
                      Home
                    </Link>
                  </li>

                  <li className="relative group">
                    <Link
                      href="/"
                      className={
                        "text-white block text-base leading-[22px] font-normal transition-colors duration-200"
                      }
                    >
                      Home
                    </Link>
                  </li>

                  <li className="relative group">
                    <Link
                      href="/"
                      className={
                        "text-white block text-base leading-[22px] font-normal transition-colors duration-200"
                      }
                    >
                      Home
                    </Link>
                  </li>
                </ul>
              </div>
              <DrawerFooter>
                <button className="bg-[#F5A99A] hover:bg-[#f5a99a]/90 text-black text-base px-5 py-2 rounded-none transition-all font-normal">
                  Login
                </button>
                <button className="border border-[#F5A99A] text-[#F5A99A] hover:bg-[#F5A99A] hover:text-black font-normal px-5 py-2 rounded-none text-base transition-all">
                  Join Us
                </button>
                {/* <DrawerClose asChild>
                <button variant="outline">Cancel</button>
              </DrawerClose> */}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}
