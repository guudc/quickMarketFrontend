"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Phone,
  RefreshCw,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Download,
  Edit,
  Star,
  Navigation,
  AlertCircle,
} from "lucide-react"

interface OrderItem {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    pricePerKg: number
    images: string[]
    category: string
  }
}

interface TimelineEvent {
  status: string
  timestamp: string
  description: string
}

interface OrderDetails {
  id: string
  userId: string
  items: OrderItem[]
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled"
  totalAmount: number
  deliveryDate: string
  deliveryPoint: string
  createdAt: string
  paymentStatus: "paid" | "pending" | "failed"
  paymentMethod: string
  deliveryType: "pickup" | "home"
  deliveryFees: number
  subtotal: number
  timeline: TimelineEvent[]
}

const statusConfig = {
  pending: { color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50", icon: Clock },
  confirmed: { color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50", icon: CheckCircle },
  out_for_delivery: { color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50", icon: Truck },
  delivered: { color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle },
  cancelled: { color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
}

 
export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation] = useState("Yaba") 
  const router = useRouter()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/dashboard/orders/${params.id}`)
        const data = await response.json()

        if (data.success) {
          setOrder(data.data)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error("Error fetching order details:", error)
        
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReorder = async () => {
    if (!order) return

    // Check if order window is open
    const today = new Date().getDay()
    const isOrderWindowOpen = today === 0 || today === 1

    if (!isOrderWindowOpen) {
     
      return
    }

    // Add items to cart and redirect
    const cartItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }))

    localStorage.setItem("quickmarket_cart", JSON.stringify(cartItems))


    router.push("/cart")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0}  />
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0}  />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order not found</h2>
              <p className="text-muted-foreground mb-6">
                The order you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Order {order.id}</h1>
              <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${statusConfig[order.status].color} text-white`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status.replace("_", " ").toUpperCase()}
              </Badge>
              {(order.status === "out_for_delivery" || order.status === "delivered") && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}/track`)}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Live Tracking
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Items</CardTitle>
                  {(order.status === "pending" || order.status === "confirmed") && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Modify Order
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex space-x-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.product.category}
                        </Badge>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-muted-foreground">
                            ₦{item.product.pricePerKg.toLocaleString()}/kg × {item.quantity}kg
                          </p>
                          <p className="font-semibold">₦{(item.product.pricePerKg * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < order.timeline.length - 1 && <div className="w-px h-8 bg-border mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{event.status}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {order.status === "delivered" && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate Your Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Delivery</h4>
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-5 w-5 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Product Quality</h4>
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-5 w-5 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-medium mb-2">Overall</h4>
                        <div className="flex justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-5 w-5 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Submit Feedback</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fees</span>
                  <span>₦{order.deliveryFees.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₦{order.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Delivery Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.deliveryDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {order.deliveryType === "pickup" ? "Pickup Point" : "Delivery Address"}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.deliveryPoint}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.paymentMethod}</p>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      {order.paymentStatus === "paid"
                        ? "Paid"
                        : order.paymentStatus === "pending"
                          ? "Payment Pending"
                          : "Payment Failed"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === "delivered" && (
                <Button onClick={handleReorder} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reorder Items
                </Button>
              )}

              {order.status === "out_for_delivery" && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/orders/${order.id}/track`)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Track Live
                </Button>
              )}

              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>

              {order.status !== "delivered" && order.status !== "cancelled" && (
                <Button variant="outline" className="w-full bg-transparent">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
