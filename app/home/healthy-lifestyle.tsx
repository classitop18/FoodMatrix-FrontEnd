"use client";
import CommonHeading from "./common-heading";
import Image from "next/image";
import FamilyWelnessImage from "@/public/family-welness-image.svg";
import healthyFoodBanner from "@/public/healthy-food-banner.svg";

export default function HealthyLifestyleSection() {
  return (
    <>
      <section
        className="py-14 lg:py-20 w-full relative bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${healthyFoodBanner.src})` }}
      >
        <div className="xl:w-[1320px] mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row gap-6 items-center lg:justify-between">
            <CommonHeading
              className="lg:w-[546px] ms-0 text-left"
              badgeText="Let connect to change toward Healthy Lifestyle"
              title="Ready To Transfer your food Budget"
              description="Take control of your spending with AI-powered guidance designed to cut costs and reduce waste. Start making affordable, healthy eating effortless with personalized budgeting insights."
              buttonComp="GET_ENROLL"
            />
          </div>
        </div>
      </section>
    </>
  );
}
