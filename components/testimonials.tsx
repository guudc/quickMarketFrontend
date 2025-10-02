"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Adunni Okafor",
      location: "Yaba",
      text: "I now save 40% on groceries every month! Quick Market has been a game-changer for my family budget.",
      rating: 5,
    },
    {
      name: "Chidi Emeka",
      location: "Surulere",
      text: "The convenience is unmatched. I plan my groceries once and they arrive fresh every week.",
      rating: 5,
    },
    {
      name: "Fatima Hassan",
      location: "Ikeja",
      text: "Bulk buying has never been easier. My roommates and I split costs and everyone saves money.",
      rating: 5,
    },
    {
      name: "Tunde Adebayo",
      location: "Lekki",
      text: "Quality products at unbeatable prices. Quick Market delivers exactly what they promise.",
      rating: 5,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (  
    <section className="py-20 bg-m uted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What Our Customers Say</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg md:text-xl text-foreground mb-6 text-pretty">
                "{testimonials[currentIndex].text}"
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
