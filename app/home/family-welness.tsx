'use client';
import StartedButton from "@/components/common/buttons/theme-button-arrow";
import CommonHeading from "./common-heading";
import Image from "next/image";
import FamilyWelnessImage from "@/public/family-welness-image.svg";

export default function FamilyWelnessSection() {
    return (

        <section className="py-14 lg:py-20 w-full bg-black relative">

            <div className="xl:w-[1320px] mx-auto px-6 relative">
                <div className="flex flex-col lg:flex-row gap-6 items-center lg:justify-between">
                    <CommonHeading
                        className="text-white lg:w-[546px] ms-0 text-left"
                        badgeText="AI for Smart Family Welness"
                        title="Smarter Meal Plans & Health Advice for Your Whole Family"
                        description="Give your family the power of AI-driven nutrition and wellness insights that make eating healthier, planning smarter, and living better easier than ever."
                        buttonComp="BUTTON_CHECK_PLAN"
                    />
                    <Image
                        src={FamilyWelnessImage}
                        className=""
                        width={420}
                        height={420}
                        alt="Family Welness"
                    />
                    
                </div>
            </div>
        </section>

    );
}