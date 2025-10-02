"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

interface PricingData {
  [location: string]: {
    "2": number
    "4": number
    "6": number
    unlimited: number
  }
}

interface SlotInlineProps {
  selectedArea?: string
}

export function SlotInline({ selectedArea }: SlotInlineProps) {
  const [pricingData, setPricingData] = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/data/slot-pricing.json")
        const data = await response.json()
        setPricingData(data)
      } catch (error) {
        console.error("Error fetching pricing data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPricingData()
  }, [])

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading prices...</span>
      </div>
    )
  }

  if (!pricingData || !selectedArea || !pricingData[selectedArea]) {
    return <span className="text-sm text-muted-foreground italic">Choose area to see prices</span>
  }

  const areaPricing = pricingData[selectedArea]

  return (
    <div className="inline-flex flex-wrap items-center gap-4 text-sm">
      <span className="font-medium text-foreground">{selectedArea} prices:</span>
      <span className="text-primary font-semibold">2 slots: {formatCurrency(areaPricing["2"])}</span>
      <span className="text-primary font-semibold">4 slots: {formatCurrency(areaPricing["4"])}</span>
      <span className="text-primary font-semibold">6 slots: {formatCurrency(areaPricing["6"])}</span>
      <span className="text-primary font-semibold">Unlimited: {formatCurrency(areaPricing["unlimited"])}</span>
    </div>
  )
}
