"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, X, ExternalLink } from "lucide-react"

interface HelpSuggestion {
  title: string
  description: string
  actionText: string
  actionUrl: string
}

const getHelpSuggestions = (pathname: string): HelpSuggestion[] => {
  switch (pathname) {
    case "/cart":
      return [
        {
          title: "Need help with checkout?",
          description: "Having trouble completing your order? We're here to help!",
          actionText: "Get Help",
          actionUrl: "/support",
        },
        {
          title: "Questions about delivery slots?",
          description: "Learn how delivery slots work with your subscription.",
          actionText: "Learn More",
          actionUrl: "/support#delivery-slots",
        },
      ]
    case "/orders":
      return [
        {
          title: "Track your order",
          description: "Get real-time updates on your order status and delivery.",
          actionText: "Track Order",
          actionUrl: "/support#order-tracking",
        },
        {
          title: "Report an issue",
          description: "Having problems with your order? Let us know immediately.",
          actionText: "Report Issue",
          actionUrl: "/support?type=order",
        },
      ]
    case "/subscribe":
      return [
        {
          title: "Questions about your plan?",
          description: "Need help choosing the right subscription package?",
          actionText: "Get Help",
          actionUrl: "/support#subscription-help",
        },
        {
          title: "Payment questions?",
          description: "Having trouble with payment or billing?",
          actionText: "Contact Support",
          actionUrl: "/support?type=payment",
        },
      ]
    case "/dashboard":
      return [
        {
          title: "New to Quick Market?",
          description: "Learn how to make the most of your subscription and orders.",
          actionText: "Getting Started",
          actionUrl: "/support#getting-started",
        },
      ]
    default:
      return []
  }
}

export function SmartHelpSuggestions() {
  const pathname = usePathname()
  const [suggestions, setSuggestions] = useState<HelpSuggestion[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [dismissedPaths, setDismissedPaths] = useState<string[]>([])

  useEffect(() => {
    const newSuggestions = getHelpSuggestions(pathname)
    setSuggestions(newSuggestions)

    // Show suggestions if there are any and this path hasn't been dismissed
    if (newSuggestions.length > 0 && !dismissedPaths.includes(pathname)) {
      // Delay showing suggestions to avoid overwhelming users
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [pathname, dismissedPaths])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissedPaths((prev) => [...prev, pathname])
  }

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Need Help?</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="space-y-2">
                <div>
                  <p className="font-medium text-sm">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7 bg-transparent"
                  onClick={() => window.open(suggestion.actionUrl, "_blank")}
                >
                  {suggestion.actionText}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
