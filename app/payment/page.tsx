"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Loader2, CheckCircle, XCircle, ArrowLeft, Shield, Clock } from "lucide-react"

interface PaymentData {
  orderId: string
  amount: number
  reference: string
  items: any[]
  deliveryInfo: any
}

export default function PaymentPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const orderId = searchParams.get("orderId")
    const amount = searchParams.get("amount")
    const reference = searchParams.get("reference")

    if (!orderId || !amount || !reference) {
      toast({
        title: "Invalid Payment Session",
        description: "Payment information is missing. Redirecting to cart.",
        variant: "destructive",
      })
      router.push("/cart")
      return
    }

    // Load order data from localStorage or API
    const orderData = localStorage.getItem("pending_order")
    if (orderData) {
      const parsedData = JSON.parse(orderData)
      setPaymentData({
        orderId,
        amount: Number.parseInt(amount),
        reference,
        items: parsedData.items || [],
        deliveryInfo: parsedData.deliveryInfo || {},
      })
    }
  }, [searchParams, router])

  const initializePayment = async () => {
    if (!paymentData) return

    setProcessing(true)
    setPaymentStatus("processing")

    try {
      // Initialize Paystack payment
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/payments/paystack/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user@example.com", // This would come from user session
          amount: paymentData.amount * 100, // Paystack expects amount in kobo
          packageId: "weekly-package",
          locationId: selectedLocation.toLowerCase(),
          reference: paymentData.reference,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Simulate Paystack redirect/modal
        // In production, you would redirect to data.data.authorization_url
        // or open Paystack inline modal

        // Simulate payment processing time
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // Verify payment
        await verifyPayment()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Payment initialization failed:", error)
      setPaymentStatus("failed")
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const verifyPayment = async () => {
    if (!paymentData) return

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/payments/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: paymentData.reference,
          orderId: paymentData.orderId,
        }),
      })

      const data = await response.json()

      if (data.success && data.data.status === "success") {
        setPaymentStatus("success")

        // Store completed order data
        localStorage.setItem("completed_order", localStorage.getItem("pending_order") || "{}")

        // Clear pending order data
        localStorage.removeItem("pending_order")
        localStorage.removeItem("quickmarket_cart")

        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed and payment processed.",
        })

        setTimeout(() => {
          const params = new URLSearchParams({
            orderId: paymentData.orderId,
            reference: paymentData.reference,
            amount: paymentData.amount.toString(),
          })
          router.push(`/payment/success?${params.toString()}`)
        }, 2000)
      } else {
        setPaymentStatus("failed")

        setTimeout(() => {
          const params = new URLSearchParams({
            orderId: paymentData.orderId,
            reference: paymentData.reference,
            amount: paymentData.amount.toString(),
            reason: "network_error",
            message: data.data?.message || "Payment verification failed",
          })
          router.push(`/payment/failed?${params.toString()}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Payment verification failed:", error)
      setPaymentStatus("failed")

      setTimeout(() => {
        const params = new URLSearchParams({
          orderId: paymentData.orderId,
          reference: paymentData.reference,
          amount: paymentData.amount.toString(),
          reason: "network_error",
          message: "Failed to verify payment status",
        })
        router.push(`/payment/failed?${params.toString()}`)
      }, 2000)
    }
  }

  const retryPayment = () => {
    setPaymentStatus("pending")
    setProcessing(false)
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading payment information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/checkout")} className="mb-6" disabled={processing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checkout
        </Button>

        {/* Payment Status */}
        <div className="text-center mb-8">
          {paymentStatus === "pending" && (
            <div>
              <CreditCard className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
              <p className="text-muted-foreground">Secure payment processing with Paystack</p>
            </div>
          )}

          {paymentStatus === "processing" && (
            <div>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
              <h1 className="text-3xl font-bold mb-2">Processing Payment</h1>
              <p className="text-muted-foreground">Please wait while we process your payment...</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div>
              <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">Redirecting to payment success page...</p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div>
              <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-muted-foreground">There was an issue processing your payment</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Order ID</span>
              <Badge variant="outline" className="font-mono">
                {paymentData.orderId}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Payment Reference</span>
              <span className="font-mono text-sm">{paymentData.reference}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span>₦{paymentData.amount.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secured by Paystack SSL encryption</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Preview */}
        {paymentData.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items ({paymentData.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentData.items.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} × {item.quantity}kg
                    </span>
                    <span>₦{(item.product.pricePerKg * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {paymentData.items.length > 3 && (
                  <p className="text-sm text-muted-foreground">+{paymentData.items.length - 3} more items</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {paymentStatus === "pending" && (
            <Button onClick={initializePayment} className="w-full h-12 text-base font-semibold" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₦{paymentData.amount.toLocaleString()}
                </>
              )}
            </Button>
          )}

          {paymentStatus === "processing" && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-blue-800">Do not close this page. Payment is being processed...</p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <>
              <Button onClick={retryPayment} className="w-full">
                <CreditCard className="h-5 w-5 mr-2" />
                Retry Payment
              </Button>
              <Button variant="outline" onClick={() => router.push("/checkout")} className="w-full">
                Back to Checkout
              </Button>
            </>
          )}

          {paymentStatus === "success" && (
            <Button onClick={() => router.push(`/payment/success?orderId=${paymentData.orderId}`)} className="w-full">
              <CheckCircle className="h-5 w-5 mr-2" />
              View Payment Success
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
