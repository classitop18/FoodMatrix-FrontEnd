"use client";
import CommonHeading from "./common-heading";
import Image from "next/image";

import ourFood from "@/public/our-food.svg";
import patternOne from "@/public/quote-bg-1.svg";
import patternTwo from "@/public/quote-bg-2.svg";

export default function OurFoodSection() {
  return (
    <section className="py-14 lg:py-20 w-full bg-[var(--primary)] relative overflow-hidden">
      <div className="xl:w-[1320px] mx-auto px-6 relative">
        <CommonHeading
          className="text-white relative z-[1]"
          badgeText="Our Food Matrix"
          title="Take the First Step Toward Smarter Eating"
          description="WE combines intelligent budgeting with health optimization to help families make better choices without breaking the bank."
        />

        <div
          className="md:max-h-[680px] md:max-w-[680px] max-h-[580px] max-w-[580px] w-auto h-auto mx-auto relative
                after:hidden after:md:block after:absolute after:inset-0 after:m-auto after:h-[980px] after:w-[980px] after:bg-black after:rounded-full after:opacity-6 after:-left-1/5
                before:hidden before:md:block before:absolute before:inset-0 before:m-auto before:h-[1345px] before:w-[1345px] before:bg-black before:rounded-full before:opacity-6 before:-left-1/2
                "
        >
          <Image
            src={ourFood}
            className="h-full w-full mx-auto animate-spin [animation-duration:25s]"
            width={680}
            height={680}
            alt="Logo Here"
          />

          <div className="font-medium p-3 absolute z-[2] lg:top-0 lg:-left-30 md:top-0 md:left-0 hidden md:flex items-center justify-center max-w-[253px] ">
            <Image
              src={patternOne}
              className="absolute"
              width={253}
              height={87}
              alt="pattern"
            />
            <span className="relative">
              Save up to 30% on your monthly food expenses
            </span>
          </div>

          <div className="font-medium p-3 absolute z-[2] xl:bottom-50 xl:-left-50 lg:-left-36 lg:bottom-50 md:-left-5 md:bottom-25 hidden md:flex items-center justify-center max-w-[253px] ">
            <Image
              src={patternOne}
              className="absolute"
              width={253}
              height={87}
              alt="pattern"
            />
            <span className="relative">
              Support for multiple dietary restrictions & allergies.
            </span>
          </div>

          <div className="font-medium p-3 absolute z-[2] xl:bottom-50 xl:-right-50 lg:-right-20 lg:bottom-10 md:-right-5 md:bottom-10 hidden md:flex items-center justify-center max-w-[265px] ">
            <Image
              src={patternTwo}
              className="absolute"
              width={265}
              height={87}
              alt="pattern"
            />
            <span className="relative ps-7">
              Real time Budget Protection & overspending alerts.
            </span>
          </div>

          <div className="font-medium p-3 absolute z-[2] lg:top-10 lg:-right-25 md:top-10 md:-right-5 hidden md:flex items-center justify-center max-w-[265px]">
            <Image
              src={patternTwo}
              className="absolute"
              width={265}
              height={87}
              alt="pattern"
            />
            <span className="relative ps-7">
              Meet your health goal while staying within budget.
            </span>
          </div>
        </div>

        <div className="max-w-[462px] text-center text-white mx-auto font-extrabold lg:text-2xl md:text-xl text-lg md:mt-0 mt-5">
          Personalized recipes recommendation for every family member{" "}
        </div>
      </div>
    </section>
  );
}
