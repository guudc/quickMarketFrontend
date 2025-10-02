"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlanModal } from "./plan-modal"
import { formatCurrency } from "@/lib/utils"

interface SubscriptionToggleProps {
  selectedArea: string
  onSubscriptionChange: (isSubscribed: boolean, plan?: any) => void
  currentPlan?: any
}

export function SubscriptionToggle({ selectedArea, onSubscriptionChange, currentPlan }: SubscriptionToggleProps) {
  const [isSubscribed, setIsSubscribed] = useState(!!currentPlan)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)

  const handleToggleChange = (checked: boolean) => {
    setIsSubscribed(checked)

    if (checked && !selectedPlan) {
      // Show plan selection modal
      setShowPlanModal(true)
    } else if (!checked) {
      // Switch to pay-as-you-go
      setSelectedPlan(null)
      onSubscriptionChange(false)
    } else {
      // Already have a plan
      onSubscriptionChange(true, selectedPlan)
    }
  }

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan)
    setIsSubscribed(true)
    onSubscriptionChange(true, plan)
  }

  const handleChangePlan = () => {
    setShowPlanModal(true)
  }

  return (
    <>
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="subscription-toggle" className="text-base font-medium">
                Subscription Plan
              </Label>
              <p className="text-sm text-muted-foreground">
                {isSubscribed && selectedPlan
                  ? `${selectedPlan.type === "pay-as-you-go" ? "Pay As You Go" : `${selectedPlan.type} Slots`} - ${formatCurrency(selectedPlan.price)}/month`
                  : "Switch to subscription for better savings"}
              </p>
            </div>
            <Switch id="subscription-toggle" checked={isSubscribed} onCheckedChange={handleToggleChange} />
          </div>

          {isSubscribed && selectedPlan && selectedPlan.type !== "pay-as-you-go" && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedPlan.type} Slots Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedPlan.price)}/month for {selectedArea}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleChangePlan}>
                  Change Plan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        selectedArea={selectedArea}
        onPlanSelect={handlePlanSelect}
      />
    </>
  )
}
