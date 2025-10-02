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
  CheckCircle,
  Package,
  Truck,
  Clock,
  MapPin,
  Download,
  Share2,
  ShoppingBag,
  CreditCard,
  Calendar,
  Phone,
  Mail,
} from "lucide-react"

interface PaymentSuccessData {
  orderId: string
  paymentReference: string
  amount: number
  paymentMethod: string
  timestamp: string
  items: any[]
  deliveryInfo: any
}

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const orderId = searchParams.get("orderId")
        const reference = searchParams.get("reference")
        const amount = searchParams.get("amount")

        if (!orderId || !reference || !amount) {
          toast({
            title: "Invalid Payment Session",
            description: "Payment information is missing. Redirecting to dashboard.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Load order data from localStorage or API
        const orderData = localStorage.getItem("completed_order")
        if (orderData) {
          const parsedData = JSON.parse(orderData)
          setPaymentData({
            orderId,
            paymentReference: reference,
            amount: Number.parseInt(amount),
            paymentMethod: "Card",
            timestamp: new Date().toISOString(),
            items: parsedData.items || [],
            deliveryInfo: parsedData.deliveryInfo || {},
          })
        } else {
          // Fallback: create basic payment data
          setPaymentData({
            orderId,
            paymentReference: reference,
            amount: Number.parseInt(amount),
            paymentMethod: "Card",
            timestamp: new Date().toISOString(),
            items: [],
            deliveryInfo: {},
          })
        }

        // Clear pending order data
        localStorage.removeItem("pending_order")
        localStorage.removeItem("quickmarket_cart")
      } catch (error) {
        console.error("Error loading payment data:", error)
        toast({
          title: "Error",
          description: "Failed to load payment information.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPaymentData()
  }, [searchParams, router, toast])

  const getDeliveryDate = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    let daysToAdd = 4 - dayOfWeek // Thursday
    if (dayOfWeek === 0) daysToAdd = 4 // Sunday -> Thursday
    if (dayOfWeek === 1) daysToAdd = 4 // Monday -> Friday
    if (daysToAdd <= 0) daysToAdd += 7

    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + daysToAdd)

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownloadReceipt = () => {
    if (!paymentData) return

    const receiptData = {
      orderId: paymentData.orderId,
      paymentReference: paymentData.paymentReference,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      timestamp: paymentData.timestamp,
      items: paymentData.items,
      deliveryInfo: paymentData.deliveryInfo,
    }

    const dataStr = JSON.stringify(receiptData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `QuickMarket_Receipt_${paymentData.orderId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Receipt Downloaded",
      description: "Your payment receipt has been downloaded successfully.",
    })
  }

  const handleShareOrder = async () => {
    if (!paymentData) return

    const shareData = {
      title: "Quick Market Order",
      text: `I just placed an order with Quick Market! Order #${paymentData.orderId}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
        toast({
          title: "Link Copied",
          description: "Order link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading payment confirmation...</p>
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
              <Button onClick={() => router.push("/dashboard")} className="mt-4">
                Go to Dashboard
              </Button>
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground mb-2">Your order has been placed successfully</p>
          <p className="text-sm text-muted-foreground">
            Transaction completed on {new Date(paymentData.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Payment Confirmation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <span className="font-medium">Amount Paid</span>
              <span className="text-lg font-bold text-green-600">₦{paymentData.amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Method</span>
              <span>{paymentData.paymentMethod}</span>
            </div>

            <Separator />

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Payment Confirmed</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your payment has been successfully processed and your order is confirmed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {paymentData.items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Order Summary ({paymentData.items.length} items)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentData.items.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{item.product.name}</span>
                      <span className="text-muted-foreground ml-2">× {item.quantity}kg</span>
                    </div>
                    <span className="font-medium">₦{(item.product.pricePerKg * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {paymentData.items.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{paymentData.items.length - 5} more items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Delivery Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Expected Delivery Date</p>
                <p className="text-sm text-muted-foreground">{getDeliveryDate()}</p>
                <p className="text-xs text-muted-foreground">Between 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Delivery Location</p>
                <p className="text-sm text-muted-foreground">
                  {paymentData.deliveryInfo.type === "home"
                    ? paymentData.deliveryInfo.homeAddress || `${selectedLocation} Area`
                    : `Pickup Point - ${selectedLocation} Area`}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">What's Next?</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll prepare your items and confirm availability</li>
                <li>• You'll receive delivery confirmation via SMS/WhatsApp</li>
                <li>• Track your order status in real-time</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => router.push(`/orders/${paymentData.orderId}`)}
            className="w-full h-12 text-base font-semibold"
          >
            <Package className="h-5 w-5 mr-2" />
            Track Your Order
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="h-11">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>

            <Button variant="outline" onClick={handleDownloadReceipt} className="h-11 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          <Button variant="ghost" onClick={handleShareOrder} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Order
          </Button>
        </div>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you have any questions about your order, our support team is here to help.
            </p>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">+234 800 QUICK MARKET</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">support@quickmarket.ng</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
