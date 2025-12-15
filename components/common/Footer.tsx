import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo-white.svg";

import Button from "./buttons/black-button";
import BorderButton from "./buttons/border-button";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-10 pb-6 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* <!-- TOP SECTION: LOGO + MENU + TOP BUTTON --> */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* <!-- LOGO --> */}
          <div className="flex items-center gap-3">
            {/* ---------- LOGO ---------- */}
            <Link
              href={"/"}
              className="flex flex-col leading-tight cursor-pointer"
            >
              <Image src={logo} width={222} height={50} alt="Logo Here" />
            </Link>
          </div>

          {/* <!-- MENU --> */}
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            <Link
              href="/"
              className="hover:text-[var(--green)] transition text-base lg:text-lg"
            >
              Home
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--green)] transition text-base lg:text-lg"
            >
              About Us
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--green)] transition text-base lg:text-lg"
            >
              Why Food Matrix
            </Link>
            <Link
              href="#"
              className="hover:text-[var(--green)] transition text-base lg:text-lg"
            >
              Contact
            </Link>
          </nav>

          {/* <!-- SCROLL TOP BUTTON --> */}
          <Link
            href={"#GoToNav"}
            className="flex items-center gap-4 text-base lg:text-lg cursor-pointer"
          >
            Go To Top
            <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center shadow-lg hover:bg-[#6848d6] transition">
              <ArrowUp className="text-white" />
            </div>
          </Link>
        </div>

        {/* <!-- CONTACT BOXES --> */}
        <div className="border border-white rounded-xl mt-10 p-4 flex flex-wrap gap-4 justify-between">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-3 px-4 py-3 border border-white/20 rounded-lg text-base w-full md:w-auto">
              <Mail className="text-[#7C59FF] size-5" />
              <p className="text-sm">hello@foodmatrix.com</p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border border-white/20 rounded-lg text-base w-full md:w-auto">
              <Phone className="text-[#7C59FF] size-5" />
              <p className="text-sm">+91 91813 23 2309</p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border border-white/20 rounded-lg text-base w-full md:w-auto">
              <MapPin className="text-[#7C59FF] size-5" />
              Official Location
            </div>
          </div>

          <div className="flex items-center justify-center text-sm text-white">
            © 2025 FoodMatrix | All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
