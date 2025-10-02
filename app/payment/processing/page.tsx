"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock, Shield, AlertTriangle, Phone, Mail, CreditCard } from "lucide-react"

interface ProcessingData {
  orderId: string
  paymentReference: string
  amount: number
  startTime: number
}

export default function PaymentProcessingPage() {
  const [processingData, setProcessingData] = useState<ProcessingData | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showTimeout, setShowTimeout] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const TIMEOUT_THRESHOLD = 60000 // 60 seconds
  const PROCESSING_MESSAGES = [
    "Connecting to payment gateway...",
    "Verifying payment details...",
    "Processing your transaction...",
    "Confirming payment with your bank...",
    "Finalizing your order...",
  ]

  useEffect(() => {
    const loadProcessingData = () => {
      const orderId = searchParams.get("orderId")
      const reference = searchParams.get("reference")
      const amount = searchParams.get("amount")

      if (!orderId || !reference || !amount) {
        toast({
          title: "Invalid Payment Session",
          description: "Payment information is missing. Redirecting to cart.",
          variant: "destructive",
        })
        router.push("/cart")
        return
      }

      setProcessingData({
        orderId,
        paymentReference: reference,
        amount: Number.parseInt(amount),
        startTime: Date.now(),
      })
    }

    loadProcessingData()
  }, [searchParams, router, toast])

  useEffect(() => {
    if (!processingData) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - processingData.startTime
      setTimeElapsed(elapsed)

      if (elapsed > TIMEOUT_THRESHOLD) {
        setShowTimeout(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [processingData])

  useEffect(() => {
    if (!processingData) return

    // Simulate payment processing
    const processPayment = async () => {
      try {
        // Wait for a random time between 3-8 seconds
        const processingTime = Math.random() * 5000 + 3000

        await new Promise((resolve) => setTimeout(resolve, processingTime))

        // Simulate payment verification
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/payments/paystack/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: processingData.paymentReference,
            orderId: processingData.orderId,
          }),
        })

        const data = await response.json()

        if (data.success && data.data.status === "success") {
          // Store completed order data
          const orderData = localStorage.getItem("pending_order")
          if (orderData) {
            localStorage.setItem("completed_order", orderData)
          }

          // Redirect to success page
          const params = new URLSearchParams({
            orderId: processingData.orderId,
            reference: processingData.paymentReference,
            amount: processingData.amount.toString(),
          })

          router.push(`/payment/success?${params.toString()}`)
        } else {
          // Redirect to failure page
          const params = new URLSearchParams({
            orderId: processingData.orderId,
            reference: processingData.paymentReference,
            amount: processingData.amount.toString(),
            reason: "network_error",
            message: data.data?.message || "Payment verification failed",
          })

          router.push(`/payment/failed?${params.toString()}`)
        }
      } catch (error) {
        console.error("Payment processing error:", error)

        // Redirect to failure page
        const params = new URLSearchParams({
          orderId: processingData.orderId,
          reference: processingData.paymentReference,
          amount: processingData.amount.toString(),
          reason: "network_error",
          message: "Payment processing failed",
        })

        router.push(`/payment/failed?${params.toString()}`)
      }
    }

    processPayment()
  }, [processingData, router])

  const getCurrentMessage = () => {
    const messageIndex = Math.floor(timeElapsed / 2000) % PROCESSING_MESSAGES.length
    return PROCESSING_MESSAGES[messageIndex]
  }

  const getEstimatedTime = () => {
    const remaining = Math.max(0, 30 - Math.floor(timeElapsed / 1000))
    return remaining
  }

  const handleCheckStatus = async () => {
    if (!processingData) return

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/payments/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: processingData.paymentReference,
          orderId: processingData.orderId,
        }),
      })

      const data = await response.json()

      if (data.success && data.data.status === "success") {
        const params = new URLSearchParams({
          orderId: processingData.orderId,
          reference: processingData.paymentReference,
          amount: processingData.amount.toString(),
        })

        router.push(`/payment/success?${params.toString()}`)
      } else {
        toast({
          title: "Payment Still Processing",
          description: "Your payment is still being processed. Please wait a moment longer.",
        })
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      toast({
        title: "Status Check Failed",
        description: "Unable to check payment status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!processingData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading payment session...</p>
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
        {/* Processing Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Processing Your Payment</h1>
          <p className="text-lg text-muted-foreground mb-2">Please wait while we process your transaction</p>
          <p className="text-sm text-muted-foreground">{getCurrentMessage()}</p>
        </div>

        {/* Processing Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order ID</span>
              <Badge variant="outline" className="font-mono text-sm">
                {processingData.orderId}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Reference</span>
              <span className="font-mono text-sm text-muted-foreground">{processingData.paymentReference}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Amount</span>
              <span className="text-lg font-bold">₦{processingData.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Status</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Processing
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex space-x-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      Math.floor(timeElapsed / 1000) % 4 === i ? "bg-primary" : "bg-gray-300"
                    }`}
                    style={{
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {!showTimeout && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated time remaining: {getEstimatedTime()} seconds
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (timeElapsed / 30000) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 mb-1">Please Do Not Close This Window</p>
                  <p className="text-sm text-yellow-800">
                    Closing this page may interrupt the payment process. Your transaction is being securely processed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeout Handling */}
        {showTimeout && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Taking Longer Than Usual</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800 mb-3">
                  Your payment is taking longer than expected. This can happen due to network conditions or bank
                  processing delays.
                </p>
                <p className="text-sm text-orange-700 font-medium">
                  Don't worry - your payment is still being processed securely.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleCheckStatus} variant="outline" className="w-full bg-transparent">
                  <Clock className="h-4 w-4 mr-2" />
                  Check Payment Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 mb-1">Secure Payment Processing</p>
                <p className="text-sm text-green-800">
                  Your payment is being processed through our secure payment gateway with bank-level encryption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        {showTimeout && (
          <Card>
            <CardHeader>
              <CardTitle>Need Immediate Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If your payment continues to process for an unusually long time, our support team can help.
              </p>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+234 800 QUICK MARKET</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">support@quickmarket.ng</span>
              </div>
              <p className="text-xs text-muted-foreground">Reference: {processingData.paymentReference}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
