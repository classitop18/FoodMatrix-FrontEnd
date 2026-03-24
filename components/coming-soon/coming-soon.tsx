
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ComingSoon() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-transparent relative overflow-hidden py-12 px-4 animate-fade-in">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-bg)] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--green)]/10 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg mx-auto animate-slide-up">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg hover:shadow-3xl transition-all duration-300">
          <div className="h-2 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary-light)] to-[var(--green)]"></div>
          
          <CardContent className="p-10 md:p-12 text-center flex flex-col items-center">
            {/* Pulsing Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary-bg)] to-white mb-8 border border-[var(--primary)]/10 shadow-sm animate-scale-in">
              <Clock className="w-10 h-10 text-[var(--primary)] animate-pulse" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--green)]/10 text-[var(--green)] px-4 py-2 rounded-full mb-6 mt-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-sm tracking-wide">Work In Progress</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] mb-4 tracking-tight">
              Coming Soon
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed">
              We're working hard to bring you something amazing. Stay tuned for exciting new updates!
            </p>

            {/* Action Button */}
            <Link 
              href="/"
              className="inline-flex flex-row items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
