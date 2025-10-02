"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  selectedArea: string
  onPlanSelect: (plan: { type: string; price: number; area: string }) => void
}

interface PricingData {
  [area: string]: {
    [slots: string]: number
    limits: {
      [slots: string]: string
    }
  }
}

export function PlanModal({ isOpen, onClose, selectedArea, onPlanSelect }: PlanModalProps) {
  const [pricingData, setPricingData] = useState<PricingData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/data/slot-pricing.json")
        const data = await response.json()
        setPricingData(data)
      } catch (error) {
        console.error("Error loading pricing data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadPricing()
    }
  }, [isOpen])

  const handlePlanSelect = (planType: string, price: number) => {
    const planData = {
      type: planType,
      price: price,
      area: selectedArea,
    }

    // Store in localStorage for persistence
    localStorage.setItem("quickmarket_selected_plan", JSON.stringify(planData))

    onPlanSelect(planData)
    onClose()
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const areaData = pricingData[selectedArea]
  if (!areaData) return null

  const plans = [
    {
      type: "pay-as-you-go",
      name: "Pay As You Go",
      description: "No subscription required",
      price: 0,
      features: ["Pay per delivery", "No commitment", "Flexible ordering"],
      popular: false,
    },
    {
      type: "2",
      name: "2 Slots",
      description: areaData.limits["2"],
      price: areaData["2"],
      features: ["2 deliveries per month", "Save on delivery fees", "Priority support"],
      popular: false,
    },
    {
      type: "4",
      name: "4 Slots",
      description: areaData.limits["4"],
      price: areaData["4"],
      features: ["4 deliveries per month", "Better savings", "Priority support"],
      popular: true,
    },
    {
      type: "6",
      name: "6 Slots",
      description: areaData.limits["6"],
      price: areaData["6"],
      features: ["6 deliveries per month", "Maximum savings", "Premium support"],
      popular: false,
    },
    {
      type: "unlimited",
      name: "Unlimited",
      description: areaData.limits["unlimited"],
      price: areaData["unlimited"],
      features: ["Unlimited deliveries", "Best value", "Premium support"],
      popular: false,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Choose Your Plan for {selectedArea}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => (
            <Card key={plan.type} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                  {plan.price > 0 && <span className="text-sm text-muted-foreground">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.type, plan.price)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
