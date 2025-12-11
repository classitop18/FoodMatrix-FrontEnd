'use client';

import ThemeButton from "@/components/common/buttons/theme-button-arrow";
import type { ReactNode } from "react";

type CommonHeadingProps = {
  badgeText?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  headingName?: string;
};

export default function CommonHeading({
  badgeText,
  title,
  description,
  className = "",
  headingName,
}: CommonHeadingProps) {




  return (
    <section className={`text-center lg:mb-10 mb-6 max-w-[680px] mx-auto ${className}`}>
      <span className="bg-[var(--green)] font-bold text-white h-8 inline-flex items-center justify-center px-3.5 rounded-full gap-1 text-sm lg:text-base">
        {badgeText}
      </span>
      <div className="text-2xl lg:text-[40px] font-extrabold leading-9 lg:leading-12 lg:my-4 my-2">{title}</div>
      <p className="text-base lg:text-lg mb-8">{description}</p>
      {/* <ThemeButton >{label}</ThemeButton> */}

      {
        headingName=="CLIENT_HEAD" && <div>ClientHeading</div>
      }
      {
        headingName=="DASHBOARD_HEAD" && <div>DashboardHeading</div>
      }
      {
        headingName=="FOOD_HEAD" && <div>FoodHeading</div>
      }

    </section>
  );
}