'use client';
import FeatureSection from "./features";
import HeroSection from "./hero";
import "../../app/globals.css";
import OurFoodSection from "./our-food";

export default function Home() {
  return (

    <>
    <HeroSection />
    <FeatureSection />
    <OurFoodSection />
    </>

  );
}