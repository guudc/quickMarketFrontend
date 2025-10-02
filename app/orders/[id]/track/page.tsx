"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Camera,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

interface TrackingUpdate {
  id: string
  timestamp: string
  status: string
  location: string
  description: string
  estimatedArrival?: string
}

interface DeliveryPartner {
  id: string
  name: string
  phone: string
  photo?: string
  rating: number
  vehicleInfo: string
}

interface OrderTracking {
  orderId: string
  status: string
  trackingUpdates: TrackingUpdate[]
  deliveryPartner?: DeliveryPartner
  deliveryInfo: {
    estimatedTime?: string
    actualDeliveryTime?: string
    deliveryPhoto?: string
  }
}


export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/orders/${params.id}/tracking`)
        const data = await response.json()

        if (data.success) {
          setTracking(data.data)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error)
        
      } finally {
        setLoading(false)
      }
    }

    fetchTrackingData()

    // Set up auto-refresh for real-time updates
    const interval = setInterval(fetchTrackingData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [params.id])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCallPartner = () => {
    if (tracking?.deliveryPartner?.phone) {
      window.open(`tel:${tracking.deliveryPartner.phone}`)
    }
  }

  const handleMessagePartner = () => {
    if (tracking?.deliveryPartner?.phone) {
      const message = `Hi, I'm tracking my order ${tracking.orderId}. Could you please provide an update?`
      window.open(`sms:${tracking.deliveryPartner.phone}?body=${encodeURIComponent(message)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0}  />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Tracking information not available</h2>
              <p className="text-muted-foreground mb-6">We couldn't find tracking information for this order.</p>
              <Button onClick={() => router.push(`/orders/${params.id}`)}>Back to Order Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push(`/orders/${params.id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order Details
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Live Tracking</h1>
          <p className="text-muted-foreground">Order {tracking.orderId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Current Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {tracking.status === "delivered" ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <Truck className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {tracking.status === "delivered" ? "Delivered" : "Out for Delivery"}
                  </h3>
                  <p className="text-muted-foreground">
                    {tracking.status === "delivered"
                      ? `Delivered at ${tracking.deliveryInfo.actualDeliveryTime}`
                      : `Estimated arrival: ${tracking.deliveryInfo.estimatedTime}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Live Updates */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Live Updates</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tracking.trackingUpdates.map((update, index) => (
                    <div key={update.id} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-primary" : "bg-green-500"}`}></div>
                        {index < tracking.trackingUpdates.length - 1 && <div className="w-px h-8 bg-border mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{update.status}</h4>
                            <p className="text-sm text-muted-foreground">{update.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {update.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">{formatTime(update.timestamp)}</p>
                            {update.estimatedArrival && (
                              <p className="text-xs text-primary">ETA: {update.estimatedArrival}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Photo (if delivered) */}
            {tracking.status === "delivered" && tracking.deliveryInfo.deliveryPhoto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Delivery Confirmation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={tracking.deliveryInfo.deliveryPhoto || "/placeholder.svg"}
                      alt="Delivery confirmation photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Photo taken at delivery location</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Partner Info */}
            {tracking.deliveryPartner && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Delivery Partner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      {tracking.deliveryPartner.photo ? (
                        <Image
                          src={tracking.deliveryPartner.photo || "/placeholder.svg"}
                          alt={tracking.deliveryPartner.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-lg font-semibold">{tracking.deliveryPartner.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{tracking.deliveryPartner.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{tracking.deliveryPartner.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{tracking.deliveryPartner.vehicleInfo}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleCallPartner}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={handleMessagePartner}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                {tracking.status !== "delivered" && (
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Clock className="h-4 w-4 mr-2" />
                    Reschedule Delivery
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
