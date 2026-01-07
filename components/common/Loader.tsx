"use client";

export default function Loader() {
  return (
    <div className="fixed z-[99] inset-0 flex items-center justify-center bg-white overflow-hidden">
      {/* Main Loader (Centered) */}
      <div className="relative z-10 flex items-center justify-center w-24 h-24">
        {/* Rings */}
          {/* Outer Ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-6 border-transparent border-t-[var(--primary-light)] border-r-[var(--primary-light)] animate-spin"></div>

          {/* Middle Ring */}
          <div className="absolute inset-2 w-20 h-20 rounded-full border-6 border-transparent border-t-[var(--green-light)] border-r-[var(--green-light)] animate-spin [animation-direction:reverse] [animation-duration:1.4s]"></div>

          {/* Inner Circle */}
          <div className="absolute inset-6 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-[var(--green)] flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center"></div>
          </div>
      </div>
    </div>
  );
}

//    <h2 className="text-xl font-bold text-[var(--primary)] animate-pulse">
//                     FoodMatrix
//                 </h2>

//                 {/* Dots */}
//                 <div className="flex gap-2">
//                     <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce" />
//                     <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-light)] animate-bounce [animation-delay:150ms]" />
//                     <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)] animate-bounce [animation-delay:300ms]" />
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="w-56 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                     <div className="h-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary-light)] to-[var(--green)] animate-[shimmer_2s_ease-in-out_infinite]" />
//                 </div>
