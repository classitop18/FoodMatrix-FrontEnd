"use client";

import { HealthHeader } from "./components/health-header";
import { HealthScore } from "./components/health-score";
import { HealthProfile } from "./components/health-profile";
import { MealIntelligence } from "./components/meal-intelligence";
import { DailyTracking } from "./components/daily-tracking";
import { WearableIntegration } from "./components/wearable-integration";

export default function HealthPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in pb-24">
      <HealthHeader />


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Health Score & Profile */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[320px]">
            <HealthScore />
          </div>
          <div className="h-auto">
            <HealthProfile />
          </div>
        </div>

        {/* Right Column: Intelligence & Daily Tracking */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1">
            <MealIntelligence />
          </div>
          <div>
            <DailyTracking />
          </div>
          <div>
            <WearableIntegration />
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-12 mb-4">
        <p>FoodMatrix Health Optimization • v1.0 • Privacy Protected</p>
      </div>
    </div>
  );
}
