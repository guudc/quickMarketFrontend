"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

interface PricingData {
  [location: string]: {
    "2": number
    "4": number
    "6": number
    unlimited: number
    limits: {
      "2": string
      "4": string
      "6": string
      unlimited: string
    }
  }
}

export function PricingTable() {
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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!pricingData) {
    return <div className="text-center py-8 text-muted-foreground">Unable to load pricing data</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-primary/5">
            <th className="border border-border p-4 text-left font-semibold">Location</th>
            <th className="border border-border p-4 text-center font-semibold">2 Slots</th>
            <th className="border border-border p-4 text-center font-semibold">4 Slots</th>
            <th className="border border-border p-4 text-center font-semibold">6 Slots</th>
            <th className="border border-border p-4 text-center font-semibold">Unlimited</th>
            <th className="border border-border p-4 text-center font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(pricingData).map(([location, prices]) => (
            <tr key={location} className="hover:bg-muted/30 transition-colors">
              <td className="border border-border p-4 font-medium">{location}</td>
              <td className="border border-border p-4 text-center">{formatCurrency(prices["2"])}</td>
              <td className="border border-border p-4 text-center">{formatCurrency(prices["4"])}</td>
              <td className="border border-border p-4 text-center">{formatCurrency(prices["6"])}</td>
              <td className="border border-border p-4 text-center">{formatCurrency(prices["unlimited"])}</td>
              <td className="border border-border p-4 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <div>2 slots: {prices.limits["2"]}</div>
                  <div>4 slots: {prices.limits["4"]}</div>
                  <div>6 slots: {prices.limits["6"]}</div>
                  <div>Unlimited: {prices.limits["unlimited"]}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
