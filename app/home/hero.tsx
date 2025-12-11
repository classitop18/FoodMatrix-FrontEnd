'use client';
import Image from "next/image";
import logo from "@/public/stars.svg";
import foodBanner from "@/public/food-banner.svg";
import CheckPlanButton from "@/components/common/buttons/theme-button";
import StartedButton from "@/components/common/buttons/black-button-arrow";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import arrowBanner from "@/public/hero-curve-arrow.svg";

export default function HeroSection() {
  return (

    /* Hero Section */

    <section className="lg:max-h-[650px] lg:h-[650px] w-full bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] lg:py-[130px] py-[50px] relative">

      <div className="xl:w-[1116px] mx-auto px-6 relative z-[1]">
        <div className="flex gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1 w-[590px] relative">
            <Image
              src={arrowBanner}
              className="absolute -right-41 top-4 hidden lg:block"
              width={194}
              height={90}
              alt="Logo Here"
            />
            <span className="bg-[var(--green)] font-bold text-white h-8 inline-flex items-center justify-center px-3.5 rounded-full gap-1 text-sm lg:text-base">
              <Image
                src={logo}
                className="size-6"
                width={40}
                height={40}
                alt="Logo Here"
              />
              AI-Powered</span>
            <h1 className="text-3xl lg:text-[56px] font-extrabold leading-10 lg:leading-16 my-4">Meal Planning to Save Time, Cut Costs & Eat Healthier</h1>
            <p className="text-base lg:text-lg mb-8">Get personalized weekly meal plans tailored to your taste, goals, and lifestyle</p>
            <div className="flex gap-4 lg:gap-6 flex-wrap">
              <CheckPlanButton label="Check Our Plan" />
              <StartedButton label="Get Started Free" />
            </div>
          </div>
        </div>
      </div>
      <Image
        src={foodBanner}
        className="absolute -right-1/7 top-0 z-1 w-[920px] hidden lg:block"
        width={920}
        height={920}
        alt="Logo Here"
      />
      <div className="bg-gradient-to-r from-[#705CC7] to-[#705CC700] h-1 absolute bottom-0 w-full"></div>

      <Image
        src={pattern1}
        className="absolute -top-[264px] -left-32"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-[200px] h-[600px]"
        width={818}
        height={600}
        alt="Pattern-2"
      />
    </section>

  );
}