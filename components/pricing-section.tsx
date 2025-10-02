"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function PricingSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Location-based pricing table
  const locationPricing: Record<
    string,
    {
      "2 Slots": string;
      "4 Slots": string;
      "6 Slots": string;
      "Unlimited Slots"?: string;
    }
  > = {
    Yaba: {
      "2 Slots": "₦6,000",
      "4 Slots": "₦11,000",
      "6 Slots": "₦17,000",
      "Unlimited Slots": "₦19,000",
    },
    "Lekki Phase One": {
      "2 Slots": "₦7,500",
      "4 Slots": "₦14,000",
      "6 Slots": "₦20,500",
      "Unlimited Slots": "₦25,000",
    },
    "Lekki Phase Two": {
      "2 Slots": "₦8,500",
      "4 Slots": "₦16,000",
      "6 Slots": "₦20,500",
      "Unlimited Slots": "₦30,000",
    },
    Ikeja: {
      "2 Slots": "₦5,500",
      "4 Slots": "₦10,000",
      "6 Slots": "₦14,000",
      "Unlimited Slots": "₦19,000",
    },
    Surulere: {
      "2 Slots": "₦6,000",
      "4 Slots": "₦11,000",
      "6 Slots": "₦16,000",
    },
  };

  const plans = [
    {
      name: "Pay as you Purchase",
      description: "No subscription. Shop whenever you want.",
      features: ["No commitment", "Pay per order", "Access to all delivery windows"],
      payAsYouGo: true,
    },
    {
      name: "2 Slots",
      description: "For light users",
      features: ["2 delivery windows per month", "Basic customer support", "Area-specific pricing"],
    },
    {
      name: "4 Slots",
      description: "Family plan",
      features: [
        "4 delivery windows per month",
        "Priority customer support",
        "Area-specific pricing",
        "Bulk discounts",
      ],
      popular: true,
    },
    {
      name: "6 Slots",
      description: "Regular grocery shoppers",
      features: [
        "6 delivery windows per month",
        "Priority customer support",
        "Area-specific pricing",
        "Extra savings on selected items",
      ],
    },
  ];

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setSelectedLocation(null);
    if (plan === "Pay as you Purchase") {
      router.push("/dashboard");
    } else {
      setOpen(true);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedLocation && selectedPlan) {
      localStorage.setItem(
        "selectedLocation",
        JSON.stringify({ location: selectedLocation, plan: selectedPlan })
      );
    }
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <section className="py-12 bg-gr ay-50" id="pricing">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>
        <p className="text-gray-600 mb-10">
          Select a plan that fits your shopping habits. You can pay per order or choose a subscription for better value.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 shadow-md hover:shadow-xl transition border-2 ${
                selectedPlan === plan.name ? "border-green-500" : "border-gray-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {plan.name}
                  {plan.popular && (
                    <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <ul className="space-y-2 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="text-green-500 w-4 h-4" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" onClick={() => handlePlanSelect(plan.name)}>
                  {plan.payAsYouGo ? "Start Shopping" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Location Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-3">
            {Object.keys(locationPricing).map((loc) => (
              <Button
                key={loc}
                variant={selectedLocation === loc ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </Button>
            ))}

            {selectedLocation && selectedPlan && (
              <div className="mt-4 p-4 border rounded-md bg-white">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected plan:</span> {selectedPlan}
                </p>
                <p className="text-lg font-semibold mt-2">
                  Price: {locationPricing[selectedLocation]?.[selectedPlan as keyof typeof locationPricing[string]] ?? "—"}
                </p>

                <Button className="mt-4 w-full" onClick={handleProceedToPayment}>
                  Proceed to payment
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="w-full">
              <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
