"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
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

interface Order {
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
}

const statusConfig = {
  pending: { color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50", icon: Clock },
  confirmed: { color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50", icon: CheckCircle },
  out_for_delivery: { color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50", icon: Truck },
  delivered: { color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle },
  cancelled: { color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
}

const filterTabs = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
]

const dateRangeOptions = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(selectedStatus !== "all" && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedDateRange !== "all" && { dateRange: selectedDateRange }),
      })

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/dashboard/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus, selectedDateRange, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getItemCount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const handleReorder = async (order: Order) => {
    // Check if order window is open
    const today = new Date().getDay()
    const isOrderWindowOpen = today === 0 || today === 1 || today === 2 // Sunday = 0, Monday = 1, Tuesday = 2

    if (!isOrderWindowOpen) {
      toast({
        title: "Order Window Closed",
        description: "Orders can only be placed on Sundays, Mondays, and Tuesdays.",
        variant: "destructive",
      })
      return
    }

    // Add items to cart and redirect
    const cartItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }))

    localStorage.setItem("quickmarket_cart", JSON.stringify(cartItems))

    toast({
      title: "Items Added to Cart",
      description: `${order.items.length} items from order ${order.id} added to your cart.`,
    })

    router.push("/cart")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your Quick Market orders</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={selectedStatus === tab.key ? "default" : "outline"}
                onClick={() => setSelectedStatus(tab.key)}
                className="whitespace-nowrap"
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Search and Date Range */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by order ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            <div className="flex space-x-2">
              {dateRangeOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={selectedDateRange === option.key ? "default" : "outline"}
                  onClick={() => setSelectedDateRange(option.key)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${statusConfig[order.status].color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{getItemCount(order.items)} items</p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length} product{order.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">Delivery date</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {order.deliveryType === "pickup" ? "Pickup" : "Home Delivery"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.deliveryPoint.length > 30
                              ? `${order.deliveryPoint.substring(0, 30)}...`
                              : order.deliveryPoint}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">₦{order.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentStatus === "paid"
                              ? "Paid"
                              : order.paymentStatus === "pending"
                                ? "Payment Pending"
                                : "Payment Failed"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Product Preview */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white"
                          >
                            <Image
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {order.items[0].product.name}
                          {order.items.length > 1 &&
                            ` and ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>

                      <div className="flex space-x-2">
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        )}

                        {order.paymentStatus === "failed" && <Button size="sm">Retry Payment</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedStatus !== "all" || selectedDateRange !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "You haven't placed any orders yet. Start shopping to see your orders here!"}
              </p>
              <Button onClick={() => router.push("/dashboard")}>Start Shopping</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
