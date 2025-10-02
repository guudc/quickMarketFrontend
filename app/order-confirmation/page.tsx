"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail } from "lucide-react"

export default function OrderConfirmationPage() {
  const [selectedLocation] = useState("Yaba")
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!orderId) {
      router.push("/dashboard")
    }
  }, [orderId, router])

  const getDeliveryDay = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    if (dayOfWeek === 0) return "Thursday"
    if (dayOfWeek === 1) return "Friday"
    return "Saturday"
  }

  const getDeliveryDate = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()

    let daysToAdd = 4 - dayOfWeek // Thursday
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thank you for your order. We'll prepare your items for delivery.</p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order ID</span>
              <Badge variant="outline" className="font-mono">
                {orderId}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Status</span>
              <Badge variant="default" className="bg-green-600">
                Confirmed
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Order Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Status</span>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </CardContent>
        </Card>

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
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Delivery Schedule</p>
                <p className="text-sm text-muted-foreground">{getDeliveryDate()}</p>
                <p className="text-xs text-muted-foreground">Between 9:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Delivery Location</p>
                <p className="text-sm text-muted-foreground">{selectedLocation} Area</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-muted-foreground">We'll prepare your items and confirm availability</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Delivery Preparation</p>
                <p className="text-sm text-muted-foreground">Your order will be packed and ready for delivery</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-muted-foreground">We'll deliver your items on {getDeliveryDay()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Continue Shopping
          </Button>

          <Button variant="outline" onClick={() => window.print()} className="w-full">
            Print Order Details
          </Button>
        </div>
      </div>
    </div>
  )
}
