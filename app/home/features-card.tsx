'use client';

import { Card } from "@/components/ui/card";
import Image from "next/image";

import featureIconOne from "@/public/feature-icon-1.svg";
import featureIconTwo from "@/public/feature-icon-2.svg";
import featureIconThree from "@/public/feature-icon-3.svg";
import featureIconFour from "@/public/feature-icon-4.svg";
import featureIconFive from "@/public/feature-icon-5.svg";
import featureIconSix from "@/public/feature-icon-6.svg";

export default function FeatureCardSection() {
    return (

        <section className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 lg:gap-6">
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconOne}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">Smart Budget Control</h5>
                <p className="text-[var(--light)]">Set weekly food budget and get  real time alerts before overspending. AI Powered insights help you save money.</p>
            </Card>
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconTwo}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">Health Optimization</h5>
                <p className="text-[var(--light)]">Track dietary restrictions, allergies, and health goals. Get personalized meal recommendations for your family.</p>
            </Card>
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconThree}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">AI Powered Recipes</h5>
                <p className="text-[var(--light)]">Generate custom recipes based on your budget, health profiles, and food preferences using advanced AI.</p>
            </Card>
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconFour}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">Smart Shopping Lists</h5>
                <p className="text-[var(--light)]">Automatically generated shopping lists optimized for you budget and nutritional goals.</p>
            </Card>
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconFive}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">Family Management</h5>
                <p className="text-[var(--light)]">Manage multiple family members with individual health profiles and shared budget control.</p>
            </Card>
            <Card className="border-[#BFBFBF] shadow-none p-4 gap-0 hover:border-white hover:shadow-md transition-all duration-300">
                <Image
                    src={featureIconSix}
                    className=""
                    width={48}
                    height={48}
                    alt="Logo Here"
                />
                <h5 className="text-black lg:text-[22px] font-bold text-lg my-2">Spending Analytics</h5>
                <p className="text-[var(--light)]">Track spending patterns, budget performance, and heath progress with detailed analytics.</p>
            </Card>
        </section>

    );
}