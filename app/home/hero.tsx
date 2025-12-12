'use client';
import Image from "next/image";
import logo from "@/public/stars.svg";
import foodBanner from "@/public/food-banner.svg";
import CheckPlanButton from "@/components/common/buttons/theme-button";
import StartedButton from "@/components/common/buttons/black-button-arrow";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";
import arrowBanner from "@/public/hero-curve-arrow.svg";
import foodBannerItemOne from "@/public/foodBannerItemOne.svg";
import foodBannerItemTwo from "@/public/foodBannerItemTwo.svg";
import foodBannerItemThree from "@/public/foodBannerItemThree.svg";


export default function HeroSection() {
  return (

    /* Hero Section */

    <section id="GoToNav" className="xl:max-h-[650px] xl:h-[650px] w-full bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] xl:py-[130px] pt-[50px] md:pb-[130px] relative">

      <div className="xl:w-[1320px] mx-auto px-6 relative z-[1]">
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-20 items-center xl:justify-start justify-center xl:text-left text-center">
          <div className="md:w-[590px] relative">
            <Image
              src={arrowBanner}
              className="absolute xl:-right-41 xl:top-4 -bottom-5 -right-22 xl:rotate-none rotate-[120deg] hidden md:block"
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
            <div className="flex gap-4 lg:gap-6 flex-wrap justify-center xl:justify-start">
              <CheckPlanButton label="Check Our Plan" />
              <StartedButton label="Get Started Free" />
            </div>
          </div>
          <div className="relative flex-1 foodBanner_main">
            <Image
              src={foodBanner}
              className="foodBanner animate-spin [animation-duration:25s] xl:animate-none"
              width={920}
              height={920}
              alt="Logo Here"
            />
            <div className="foodBannerItem1 rounded-full px-6 py-2 flex items-center bg-white text-sm md:text-base lg:text-xl font-bold absolute gap-3">
              <Image
              src={foodBannerItemOne}
              className=""
              width={24}
              height={24}
              alt="Icon"
            />
              Budget Protection
            </div>
            <div className="foodBannerItem2 rounded-full px-6 py-2 flex items-center bg-white text-sm md:text-base lg:text-xl font-bold absolute gap-3">
              <Image
              src={foodBannerItemTwo}
              className=""
              width={24}
              height={24}
              alt="Icon"
            />
              Health Tracking
            </div>
            <div className="foodBannerItem3 rounded-full px-6 py-2 flex items-center bg-white text-sm md:text-base lg:text-xl font-bold absolute gap-3">
              <Image
              src={foodBannerItemThree}
              className=""
              width={24}
              height={24}
              alt="Icon"
            />
              AI Meal Planning
            </div>
          </div>
        </div>
      </div>

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
        className="absolute xl:right-0 xl:-top-[200px] right-0 -bottom-[200px] h-[600px]"
        width={818}
        height={600}
        alt="Pattern-2"
      />
    </section>

  );
}