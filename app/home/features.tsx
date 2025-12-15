"use client";
import StartedButton from "@/components/common/buttons/theme-button-arrow";
import CommonHeading from "./common-heading";
import FeatureCardSection from "./features-card";
import Image from "next/image";

import mealBoul from "@/public/meal-boul.svg";

export default function FeatureSection() {
  return (
    <section className="py-14 lg:py-20 w-full bg-white relative">
      <div className="xl:w-[1320px] mx-auto px-6 relative">
        <CommonHeading
          badgeText="Features We Provide"
          title="Everything You Need for Effortless Meal Planning"
          description="From personalized menus to smart grocery suggestions—your meal planning journey just got easier."
        />
        <FeatureCardSection />

        <div className="rounded-2xl bg-[#F3F0FD] shadow-lg py-5 px-8 mt-12 relative overflow-hidden lg:overflow-visible">
          <div className="flex gap-4 lg:gap-12 items-center flex-wrap">
            <div>
              <span className="font-bold text-lg lg:text-xl">
                Begin Planning Healthier
              </span>
              <h5 className="font-extrabold text-2xl lg:text-3xl">
                Meals with AI
              </h5>
            </div>
            <StartedButton label="Get Started Free" />
          </div>
          <Image
            src={mealBoul}
            className="h-auto absolute right-0 xl:-right-16 bottom-0 top-3 m-auto lg:block hidden"
            width={200}
            height={130}
            alt="Logo Here"
          />
        </div>
      </div>
    </section>
  );
}
