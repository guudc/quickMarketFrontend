"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      setIsVisible(scrollPosition > windowHeight * 0.5)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary p-4 shadow-lg z-40 md:hidden">
      <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-full py-3 font-semibold">
        Join Now - Start Saving
      </Button>
    </div>
  )
}
