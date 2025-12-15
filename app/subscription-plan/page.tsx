"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Crown,
  Users,
  Zap,
  Check,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Heart,
  ChefHat,
} from "lucide-react";
import Image from "next/image";
import pattern1 from "@/public/hero-pattern-1.svg";
import pattern2 from "@/public/hero-pattern-2.svg";

// Static subscription data
const staticSubscription = {
  planType: "free" as const,
  status: "active",
  familyProfilesCount: 2,
  aiOperationsUsed: 15,
  aiOperationsLimit: 50,
};

export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [subscription] = useState(staticSubscription);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for individuals getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Up to 2 family profiles",
        "50 AI recipe generations/month",
        "5 meal plans/month",
        "Basic budget tracking",
        "Standard recipes database",
      ],
      icon: <Star className="w-8 h-8" />,
      popular: false,
      gradient: "from-gray-400 to-gray-500",
      current: subscription?.planType === "free",
    },
    {
      id: "premium_monthly",
      name: "Premium",
      description: "Full-featured family meal planning",
      monthlyPrice: 7.99,
      yearlyPrice: 84.99,
      features: [
        "Up to 5 family profiles",
        "Unlimited AI recipe generations",
        "Unlimited meal planning",
        "Advanced budget analytics",
        "Health optimization insights",
        "Priority customer support",
        "Family governance features",
        "Personalized recommendations",
      ],
      icon: <Crown className="w-8 h-8" />,
      popular: true,
      gradient: "from-[var(--primary)] to-[var(--primary-light)]",
      current: subscription?.planType === "premium_monthly",
    },
    {
      id: "premium_yearly",
      name: "Premium Plus",
      description: "Best value for committed families",
      monthlyPrice: 12.99,
      yearlyPrice: 139.99,
      features: [
        "Up to 7 family profiles",
        "Unlimited AI recipe generations",
        "Unlimited meal planning",
        "Advanced budget analytics",
        "Health optimization insights",
        "Priority customer support",
        "Family governance features",
        "Personalized recommendations",
        "Early access to new features",
        "Dedicated account manager",
      ],
      icon: <Sparkles className="w-8 h-8" />,
      popular: false,
      gradient: "from-[var(--green)] to-[var(--green-light)]",
      current: subscription?.planType === "premium_yearly",
    },
  ];

  const features = [
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "AI-Powered Recipes",
      description:
        "Get personalized recipe recommendations based on your preferences",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Budget Tracking",
      description: "Monitor and optimize your food expenses effortlessly",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Health Insights",
      description: "Track nutrition and achieve your health goals",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Family Management",
      description: "Manage multiple profiles with custom preferences",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F3F0FD] to-[#F3F0FD00] relative overflow-hidden">
      {/* Background Patterns */}
      <Image
        src={pattern1}
        className="absolute -top-64 -left-32 opacity-20 pointer-events-none"
        width={818}
        height={818}
        alt="Pattern-1"
      />
      <Image
        src={pattern2}
        className="absolute right-0 -top-48 opacity-20 pointer-events-none"
        width={818}
        height={600}
        alt="Pattern-2"
      />

      <div className="relative z-10 xl:w-[1320px] mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-[var(--green)] text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-sm">Choose Your Plan</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--primary)] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your family's meal planning and budget
            management needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span
              className={`font-bold text-sm ${!isYearly ? "text-[var(--primary)]" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-[var(--green)]"
            />
            <span
              className={`font-bold text-sm ${isYearly ? "text-[var(--primary)]" : "text-gray-500"}`}
            >
              Yearly
            </span>
            <Badge className="bg-[var(--green)] text-white border-0 ml-2">
              Save 11%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 animate-fade-in">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white border-0 px-4 py-1 shadow-lg">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`border-0 shadow-2xl rounded-3xl overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-3xl ${
                  plan.popular ? "border-2 border-[var(--primary)]" : ""
                } ${plan.current ? "ring-2 ring-[var(--green)]" : ""}`}
              >
                {/* Card Header with Gradient */}
                <div
                  className={`bg-gradient-to-r ${plan.gradient} text-white p-6 pb-8`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      {plan.icon}
                    </div>
                    {plan.current && (
                      <Badge className="bg-white text-[var(--primary)] border-0 font-bold">
                        Current Plan
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-extrabold mb-2">{plan.name}</h3>
                  <p className="text-white/90 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-white/80 text-sm">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>

                  {isYearly && plan.id !== "free" && (
                    <p className="text-white/80 text-xs mt-2">
                      ${(plan.yearlyPrice / 12).toFixed(2)}/month billed
                      annually
                    </p>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="bg-[var(--green)]/10 p-1 rounded-full mt-0.5">
                          <Check className="w-4 h-4 text-[var(--green)]" />
                        </div>
                        <span className="text-sm text-gray-700 flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                      plan.current
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : plan.popular
                          ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white hover:shadow-lg hover:scale-105"
                          : "bg-white border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Get Started"}
                  </button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16 animate-slide-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[var(--primary)] mb-3">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-base">
              Powerful features to help you plan, save, and eat better
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--green)]/10 p-3 rounded-xl w-fit mb-4">
                  <div className="text-[var(--primary)]">{feature.icon}</div>
                </div>
                <h3 className="font-bold text-base text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Usage Stats for Current Plan */}
        {subscription && (
          <div className="mb-16 animate-fade-in">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white p-6">
                <CardTitle className="flex items-center gap-3 text-xl font-extrabold">
                  <Zap className="h-6 w-6" />
                  Your Current Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Family Profiles */}
                  <div className="text-center p-6 bg-gradient-to-br from-[var(--primary-bg)] to-white rounded-2xl">
                    <Users className="w-10 h-10 text-[var(--primary)] mx-auto mb-3" />
                    <div className="text-3xl font-extrabold text-[var(--primary)] mb-1">
                      {subscription.familyProfilesCount}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Family Profiles
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {subscription.planType === "free"
                        ? "of 2 allowed"
                        : "unlimited"}
                    </p>
                  </div>

                  {/* AI Operations */}
                  <div className="text-center p-6 bg-gradient-to-br from-[var(--green)]/10 to-white rounded-2xl">
                    <Sparkles className="w-10 h-10 text-[var(--green)] mx-auto mb-3" />
                    <div className="text-3xl font-extrabold text-[var(--green)] mb-1">
                      {subscription.aiOperationsUsed}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      AI Operations
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      of {subscription.aiOperationsLimit} this month
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-[var(--green)] to-[var(--green-light)] h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subscription.aiOperationsUsed / subscription.aiOperationsLimit) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Plan Status */}
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl">
                    <Crown className="w-10 h-10 text-[var(--primary-light)] mx-auto mb-3" />
                    <div className="text-3xl font-extrabold text-[var(--primary-light)] mb-1">
                      {subscription.planType === "free" ? "Free" : "Premium"}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Current Plan
                    </p>
                    <Badge className="bg-[var(--green)] text-white border-0 mt-2">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="text-center animate-slide-up">
          <h2 className="text-3xl font-extrabold text-[var(--primary)] mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mb-8">
            Common questions about FoodMatrix Premium
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-base text-gray-800 mb-2">
                What does "unlimited" AI generations mean?
              </h3>
              <p className="text-sm text-gray-600">
                Premium includes unlimited usage within fair use (about 2,000
                recipes/month, which is more than enough for any family).
              </p>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-base text-gray-800 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-gray-600">
                Yes! You can cancel your subscription at any time. Your plan
                will remain active until the end of your billing period.
              </p>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-base text-gray-800 mb-2">
                How does family management work?
              </h3>
              <p className="text-sm text-gray-600">
                Each family member gets their own profile with custom
                preferences, dietary restrictions, and health goals.
              </p>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl p-6 text-left hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-base text-gray-800 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-sm text-gray-600">
                Yes! Start with our free plan and upgrade anytime. No credit
                card required to get started.
              </p>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-3xl p-10 text-white shadow-2xl animate-scale-in">
          <h2 className="text-3xl font-extrabold mb-3">
            Ready to Transform Your Meal Planning?
          </h2>
          <p className="text-white/90 mb-6 text-base max-w-2xl mx-auto">
            Join thousands of families who are saving time, money, and eating
            healthier with FoodMatrix
          </p>
          <button className="bg-white text-[var(--primary)] px-8 py-3 rounded-full font-bold text-base hover:shadow-xl transition-all duration-300 hover:scale-105">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
