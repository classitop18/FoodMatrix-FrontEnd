'use client';
import FeatureSection from "./features";
import HeroSection from "./hero";
import "../../app/globals.css";
import OurFoodSection from "./our-food";
import FamilyWelnessSection from "./family-welness";
import OurClientSection from "./our-client";
import HealthyLifestyleSection from "./healthy-lifestyle";

export default function Home() {
  return (

    <>
      <HeroSection />
      <FeatureSection />
      <OurFoodSection />
      <FamilyWelnessSection />
      <OurClientSection />
      <HealthyLifestyleSection />
    </>

  );
}