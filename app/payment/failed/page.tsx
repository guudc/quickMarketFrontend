"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  XCircle,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Phone,
  Mail,
  ShoppingCart,
  HelpCircle,
  Clock,
  Shield,
} from "lucide-react"

interface PaymentFailureData {
  orderId: string
  paymentReference: string
  amount: number
  failureReason: string
  message: string
  timestamp: string
  items: any[]
}

const FAILURE_REASONS = {
  insufficient_funds: {
    title: "Insufficient Funds",
    description: "Your account doesn't have enough funds to complete this transaction.",
    action: "Please check your account balance or try a different payment method.",
  },
  card_declined: {
    title: "Card Declined",
    description: "Your bank has declined this transaction.",
    action: "Please contact your bank or try a different card.",
  },
  network_error: {
    title: "Network Error",
    description: "There was a connection issue during payment processing.",
    action: "Please check your internet connection and try again.",
  },
  invalid_card: {
    title: "Invalid Card Details",
    description: "The card information provided is incorrect or invalid.",
    action: "Please verify your card details and try again.",
  },
  limit_exceeded: {
    title: "Transaction Limit Exceeded",
    description: "This transaction exceeds your daily or monthly limit.",
    action: "Please contact your bank to increase your limit or try a smaller amount.",
  },
  "3ds_failed": {
    title: "3D Secure Authentication Failed",
    description: "The 3D Secure verification was not completed successfully.",
    action: "Please try again and complete the 3D Secure verification.",
  },
}

export default function PaymentFailedPage() {
  const [paymentData, setPaymentData] = useState<PaymentFailureData | null>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadFailureData = async () => {
      try {
        const orderId = searchParams.get("orderId")
        const reference = searchParams.get("reference")
        const amount = searchParams.get("amount")
        const reason = searchParams.get("reason") || "network_error"
        const message = searchParams.get("message") || "Payment processing failed"

        if (!orderId || !reference || !amount) {
          toast({
            title: "Invalid Payment Session",
            description: "Payment information is missing. Redirecting to cart.",
            variant: "destructive",
          })
          router.push("/cart")
          return
        }

        // Load order data from localStorage
        const orderData = localStorage.getItem("pending_order")
        let items: any[] = []

        if (orderData) {
          const parsedData = JSON.parse(orderData)
          items = parsedData.items || []
        }

        // Also check cart data
        const cartData = localStorage.getItem("quickmarket_cart")
        if (cartData) {
          const parsedCart = JSON.parse(cartData)
          setCartItems(parsedCart)
        }

        setPaymentData({
          orderId,
          paymentReference: reference,
          amount: Number.parseInt(amount),
          failureReason: reason,
          message,
          timestamp: new Date().toISOString(),
          items,
        })
      } catch (error) {
        console.error("Error loading failure data:", error)
        toast({
          title: "Error",
          description: "Failed to load payment information.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFailureData()
  }, [searchParams, router, toast])

  const getFailureInfo = (reason: string) => {
    return FAILURE_REASONS[reason as keyof typeof FAILURE_REASONS] || FAILURE_REASONS.network_error
  }

  const handleRetryPayment = async () => {
    if (!paymentData) return

    setRetrying(true)

    try {
      // Redirect back to payment page with same order data
      const params = new URLSearchParams({
        orderId: paymentData.orderId,
        amount: paymentData.amount.toString(),
        reference: `retry_${Date.now()}_${paymentData.orderId}`,
      })

      router.push(`/payment?${params.toString()}`)
    } catch (error) {
      console.error("Error retrying payment:", error)
      toast({
        title: "Retry Failed",
        description: "Failed to retry payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRetrying(false)
    }
  }

  const handleDifferentPaymentMethod = () => {
    // Redirect to checkout to select different payment method
    router.push("/checkout")
  }

  const handleContactBank = () => {
    toast({
      title: "Contact Your Bank",
      description: "Please call the customer service number on the back of your card.",
    })
  }

  const handlePayLater = () => {
    toast({
      title: "Pay Later Option",
      description: "This feature will be available soon. Your cart items are preserved.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading payment information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p>Payment information not found.</p>
              <Button onClick={() => router.push("/cart")} className="mt-4">
                Go to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const failureInfo = getFailureInfo(paymentData.failureReason)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={cartItems.length} onSearch={() => {}} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Failure Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Payment Failed</h1>
          <p className="text-lg text-muted-foreground mb-2">There was an issue processing your payment</p>
          <p className="text-sm text-muted-foreground">Don't worry - no charges were made to your account</p>
        </div>

        {/* Failure Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Payment Issue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">{failureInfo.title}</h3>
              <p className="text-sm text-red-800 mb-3">{failureInfo.description}</p>
              <p className="text-sm text-red-700 font-medium">{failureInfo.action}</p>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-medium">Order ID</span>
              <Badge variant="outline" className="font-mono text-sm">
                {paymentData.orderId}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Reference</span>
              <span className="font-mono text-sm text-muted-foreground">{paymentData.paymentReference}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Attempted Amount</span>
              <span className="text-lg font-bold">₦{paymentData.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Failed At</span>
              <span className="text-sm text-muted-foreground">{new Date(paymentData.timestamp).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cart Preservation Notice */}
        {cartItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Your Cart is Safe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Items Preserved</span>
                </div>
                <p className="text-sm text-green-800">
                  All {cartItems.length} items in your cart have been saved. You can retry payment or modify your order.
                </p>
              </div>

              <div className="space-y-2">
                {cartItems.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>
                      {item.product.name} × {item.quantity}kg
                    </span>
                    <span>₦{(item.product.pricePerKg * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">+{cartItems.length - 3} more items</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recovery Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleRetryPayment} className="w-full h-12 text-base font-semibold" disabled={retrying}>
              {retrying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Again
                </>
              )}
            </Button>

            <Button variant="outline" onClick={handleDifferentPaymentMethod} className="w-full h-11 bg-transparent">
              <CreditCard className="h-4 w-4 mr-2" />
              Use Different Payment Method
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleContactBank} className="h-11 bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Contact Bank
              </Button>

              <Button variant="outline" onClick={handlePayLater} className="h-11 bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                Pay Later
              </Button>
            </div>

            <Button variant="ghost" onClick={() => router.push("/cart")} className="w-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Modify Cart
            </Button>
          </CardContent>
        </Card>

        {/* Common Issues Help */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Common Payment Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Insufficient Funds</p>
                <p className="text-muted-foreground">Check your account balance or try a different card</p>
              </div>
              <div>
                <p className="font-medium">Card Declined</p>
                <p className="text-muted-foreground">Contact your bank or use an alternative payment method</p>
              </div>
              <div>
                <p className="font-medium">Network Issues</p>
                <p className="text-muted-foreground">Check your internet connection and try again</p>
              </div>
              <div>
                <p className="font-medium">Transaction Limits</p>
                <p className="text-muted-foreground">Your bank may have daily/monthly transaction limits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you continue to experience payment issues, our support team is ready to assist you.
            </p>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">+234 800 QUICK MARKET</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">support@quickmarket.ng</span>
            </div>
            <Button variant="outline" onClick={() => router.push("/support")} className="w-full mt-4">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
