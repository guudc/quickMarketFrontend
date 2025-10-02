"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Loader2, AlertCircle, Check, Star, Clock, Calendar, HelpCircle, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Package {
  id: string
  name: string
  slots: number
  price: number
  quantityLimits: {
    perItemMax: number
  }
  locationId: string
  features: string[]
  isPopular?: boolean
}

interface Location {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface ApiResponse {
  success: boolean
  data?: Package[]
  error?: string
}

export default function SubscribePage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get selected location from localStorage
    const locationData = localStorage.getItem("selectedLocation")
    if (!locationData) {
      toast({
        title: "No Location Selected",
        description: "Please select a location first.",
        variant: "destructive",
      })
      router.push("/select-location")
      return
    }

    const location: Location = JSON.parse(locationData)
    setSelectedLocation(location)
    fetchPackages(location.id)
  }, [router, toast])

  const fetchPackages = async (locationId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/packages?locationId=${locationId}`)
      const data: ApiResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch packages")
      }

      setPackages(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load packages"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (packageData: Package) => {
    try {
      setIsProcessingPayment(true)
      setSelectedPackage(packageData.id)

      // Mock user email - in production, get from auth context
      const userEmail = "user@example.com"

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/payments/paystack/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: packageData.price * 100, // Paystack expects amount in kobo
          packageId: packageData.id,
          locationId: packageData.locationId,
        }),
      })

      const paymentData = await response.json()

      if (!response.ok || !paymentData.success) {
        throw new Error(paymentData.error || "Failed to initialize payment")
      }

      // In production, redirect to Paystack checkout
      // window.location.href = paymentData.data.authorization_url

      // For demo purposes, simulate successful payment
      toast({
        title: "Payment Successful!",
        description: `Successfully subscribed to ${packageData.name}`,
      })

      // Redirect to dashboard after successful payment
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed"
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessingPayment(false)
      setSelectedPackage(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateCostPerSlot = (price: number, slots: number) => {
    if (slots === 0) return "Premium"
    return formatPrice(Math.round(price / slots))
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Packages</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => selectedLocation && fetchPackages(selectedLocation.id)} variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Choose Your Plan</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Select a subscription package for{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-[#FE0000]">
                <MapPin className="h-4 w-4" />
                {selectedLocation?.name}
              </span>
            </p>
            <p className="text-sm text-gray-500">Each slot equals one delivery window. Unused slots don't roll over.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.isPopular ? "border-[#FE0000] shadow-md scale-105" : "hover:border-[#FE0000]/50"
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#FE0000] text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">{pkg.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {pkg.slots === 0 ? "Unlimited deliveries" : `${pkg.slots} delivery windows`}
                </CardDescription>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-[#FE0000]">{formatPrice(pkg.price)}</div>
                  <div className="text-sm text-gray-500">{calculateCostPerSlot(pkg.price, pkg.slots)} per slot</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900 mb-1">Quantity Limits</div>
                  <div className="text-sm text-gray-600">
                    {pkg.quantityLimits.perItemMax === 999
                      ? "No restrictions"
                      : `Max ${pkg.quantityLimits.perItemMax} units per item`}
                  </div>
                </div>

                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#FE0000] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(pkg)}
                  disabled={isProcessingPayment}
                  className={`w-full ${
                    pkg.isPopular
                      ? "bg-[#FE0000] text-white hover:bg-[#FE0000]/90"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {isProcessingPayment && selectedPackage === pkg.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Package Comparison */}
        <div className="bg-white rounded-lg border p-6 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Package Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                  {packages.map((pkg) => (
                    <th key={pkg.id} className="text-center py-3 px-4 font-medium text-gray-900">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-600">Monthly Price</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4 font-semibold text-[#FE0000]">
                      {formatPrice(pkg.price)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-600">Delivery Windows</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.slots === 0 ? "Unlimited" : pkg.slots}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-600">Max Units per Item</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.quantityLimits.perItemMax === 999 ? "No limit" : pkg.quantityLimits.perItemMax}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-600">Cost per Slot</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {calculateCostPerSlot(pkg.price, pkg.slots)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FE0000]" />
                How do slots work?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Each slot represents one delivery window. You can place orders during our order windows (Sunday/Monday)
                for delivery on Thursday/Friday. Unused slots don't carry over to the next month.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FE0000]" />
                When are deliveries made?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Deliveries are made every Thursday and Friday. Order windows open on Sunday and close on Monday evening.
                Plan your orders accordingly to secure your preferred delivery slot.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What are quantity limits?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Quantity limits determine the maximum number of units you can purchase per item in a single order.
                Higher-tier packages allow you to buy more units of each item, perfect for bulk shopping.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next
                billing cycle. Contact our support team for assistance with plan changes.
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help choosing the right plan? Contact our support team at{" "}
              <a href="mailto:support@quickmarket.ng" className="text-[#FE0000] hover:underline">
                support@quickmarket.ng
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
