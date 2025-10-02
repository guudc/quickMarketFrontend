"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Clock, MapPin } from "lucide-react"
import { SlotInline } from "@/components/slot-inline"
import Link from "next/link"

export function HeroSection() {
  const handleSeeHowItWorks = () => {
    const element = document.getElementById("how-it-works")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-grad ient-to-br --color-white-white from-primary/5 to-primary/10 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-primary">
          <ShoppingCart size={40} />
        </div>
        <div className="absolute top-40 right-20 text-primary">
          <Clock size={32} />
        </div>
        <div className="absolute bottom-40 left-20 text-primary">
          <MapPin size={36} />
        </div>
        <div className="absolute bottom-20 right-10 text-primary">
          <ShoppingCart size={28} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
            Plan Ahead. Save Big. Eat Better.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Get the cheapest groceries in Lagos when you plan ahead. Quick Market helps you save by buying in bulk and
            delivering to your area on schedule.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 text-lg"
            >
              Get Started
            </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-3 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              onClick={handleSeeHowItWorks}
            >
              See How It Works
            </Button>
          </div>

          {/* ✅ Clean, Modern, Brand-Colored Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm mt-8">
            {/* Serving 5 Lagos Areas */}
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-bold text-primary">Serving 5 Lagos Areas</span>
            </div>

            {/* Save up to 40% */}
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="font-bold text-primary">Save up to 40%</span>
            </div>

            {/* Weekly Deliveries */}
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="font-bold text-primary">Weekly Deliveries</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-primary/20">
            <SlotInline />
          </div>
        </div>
      </div>
    </section>
  )
}
