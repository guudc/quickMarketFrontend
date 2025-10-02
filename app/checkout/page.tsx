"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { User, MapPin, Clock, Tag, Package, CreditCard, Truck, Home, RefreshCw } from "lucide-react"

interface CartItem {
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

interface ContactInfo {
  name: string
  phone: string
  email: string
}

interface DeliverySchedule {
  date: string
  timeSlot: string
  specialInstructions: string
}

interface CouponInfo {
  code: string
  discount: number
  applied: boolean
}

interface PickupPoint {
  id: string
  name: string
  address: string
  fee: number
}

interface DeliveryInfo {
  type: "pickup" | "home"
  pickupPointId?: string
  homeAddress?: string
  specialInstructions?: string
}

interface SubscriptionInfo {
  enabled: boolean
  frequency: "weekly" | "biweekly" | "monthly"
  discount: number
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false)

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: "home",
    homeAddress: "123 Main Street, Yaba, Lagos",
    specialInstructions: "",
  })

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "John Doe",
    phone: "+234 801 234 5678",
    email: "john.doe@example.com",
  })

  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule>({
    date: "",
    timeSlot: "",
    specialInstructions: "",
  })

  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    enabled: false,
    frequency: "weekly",
    discount: 0,
  })

  const [coupon, setCoupon] = useState<CouponInfo>({
    code: "",
    discount: 0,
    applied: false,
  })

  const { toast } = useToast()
  const router = useRouter()

  const getDeliveryDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6) {
        // Thu, Fri, Sat
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        dates.push({
          value: date.toISOString().split("T")[0],
          label: `${dayName}, ${dateStr}`,
        })
      }

      if (dates.length >= 3) break
    }

    return dates
  }

  const deliveryDates = getDeliveryDates()

  const timeSlots = [
    { value: "morning", label: "Morning (9:00 AM - 12:00 PM)" },
    { value: "afternoon", label: "Afternoon (12:00 PM - 4:00 PM)" },
    { value: "evening", label: "Evening (4:00 PM - 7:00 PM)" },
  ]

  const fetchPickupPoints = async () => {
    try {
      setLoadingPickupPoints(true)
      const locationKey = selectedLocation.toLowerCase().replace(/\s+/g, "-")
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/locations/${locationKey}/pickup-points`)
      const data = await response.json()

      if (data.success) {
        setPickupPoints(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error fetching pickup points:", error)
      toast({
        title: "Error",
        description: "Failed to load pickup points. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingPickupPoints(false)
    }
  }

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("quickmarket_cart")
        if (savedCart) {
          const cartData = JSON.parse(savedCart)
          setCart(cartData)

          if (cartData.length === 0) {
            router.push("/cart")
            return
          }
        } else {
          router.push("/cart")
          return
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        toast({
          title: "Error",
          description: "Failed to load cart data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
    fetchPickupPoints()
  }, [])

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.pricePerKg * item.quantity, 0)
  }

  const getDeliveryFee = () => {
    if (deliveryInfo.type === "pickup") {
      const selectedPickupPoint = pickupPoints.find((p) => p.id === deliveryInfo.pickupPointId)
      return selectedPickupPoint?.fee || 0
    }
    return 500 // Fixed home delivery fee
  }

  const getSubscriptionDiscount = () => {
    if (!subscription.enabled) return 0

    const subtotal = getSubtotal()
    switch (subscription.frequency) {
      case "weekly":
        return Math.floor(subtotal * 0.15) // 15% discount for weekly
      case "biweekly":
        return Math.floor(subtotal * 0.1) // 10% discount for biweekly
      case "monthly":
        return Math.floor(subtotal * 0.05) // 5% discount for monthly
      default:
        return 0
    }
  }

  const getCouponDiscount = () => {
    return coupon.applied ? coupon.discount : 0
  }

  const getTotalWeight = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getFinalTotal = () => {
    return getSubtotal() + getDeliveryFee() - getCouponDiscount() - getSubscriptionDiscount()
  }

  const handleApplyCoupon = () => {
    if (coupon.code.toLowerCase() === "save10") {
      setCoupon({
        ...coupon,
        discount: Math.floor(getSubtotal() * 0.1),
        applied: true,
      })
      toast({
        title: "Coupon Applied!",
        description: "You saved ₦" + Math.floor(getSubtotal() * 0.1).toLocaleString(),
      })
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon({
      code: "",
      discount: 0,
      applied: false,
    })
    toast({
      title: "Coupon Removed",
      description: "Coupon discount has been removed from your order.",
    })
  }

  const handleProceedToPayment = async () => {
    if (!deliverySchedule.date || !deliverySchedule.timeSlot) {
      toast({
        title: "Delivery Schedule Required",
        description: "Please select a delivery date and time slot.",
        variant: "destructive",
      })
      return
    }

    if (deliveryInfo.type === "pickup" && !deliveryInfo.pickupPointId) {
      toast({
        title: "Pickup Point Required",
        description: "Please select a pickup point.",
        variant: "destructive",
      })
      return
    }

    if (deliveryInfo.type === "home" && !deliveryInfo.homeAddress) {
      toast({
        title: "Delivery Address Required",
        description: "Please provide a delivery address.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const orderData = {
        items: cart,
        contactInfo,
        deliveryInfo,
        deliverySchedule,
        subscription: subscription.enabled ? subscription : null,
        coupon: coupon.applied ? coupon : null,
        totalAmount: getFinalTotal(),
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (data.success) {
        const paymentReference = `ref_${Date.now()}_${data.data.id}`

        localStorage.setItem(
          "pending_order",
          JSON.stringify({
            ...orderData,
            orderId: data.data.id,
            reference: paymentReference,
          }),
        )

        toast({
          title: "Order Created Successfully!",
          description: `Redirecting to payment for order #${data.data.id}`,
        })

        router.push(`/payment?orderId=${data.data.id}&amount=${getFinalTotal()}&reference=${paymentReference}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order Failed",
        description: "Failed to create your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={cart.length} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Delivery Type</Label>
                  <RadioGroup
                    value={deliveryInfo.type}
                    onValueChange={(value: "pickup" | "home") => setDeliveryInfo({ ...deliveryInfo, type: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="flex items-center space-x-2">
                        <Home className="h-4 w-4" />
                        <span>Home Delivery (₦500)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center space-x-2">
                        <Truck className="h-4 w-4" />
                        <span>Pickup Point (Free)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryInfo.type === "home" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="home-address">Delivery Address</Label>
                      <Textarea
                        id="home-address"
                        value={deliveryInfo.homeAddress}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, homeAddress: e.target.value })}
                        rows={2}
                        placeholder="Enter your full delivery address..."
                      />
                    </div>
                  </div>
                )}

                {deliveryInfo.type === "pickup" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="pickup-point">Select Pickup Point</Label>
                      {loadingPickupPoints ? (
                        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                      ) : (
                        <Select
                          value={deliveryInfo.pickupPointId}
                          onValueChange={(value) => setDeliveryInfo({ ...deliveryInfo, pickupPointId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a pickup point" />
                          </SelectTrigger>
                          <SelectContent>
                            {pickupPoints.map((point) => (
                              <SelectItem key={point.id} value={point.id}>
                                <div>
                                  <div className="font-medium">{point.name}</div>
                                  <div className="text-sm text-muted-foreground">{point.address}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="delivery-instructions">Special Instructions</Label>
                  <Textarea
                    id="delivery-instructions"
                    placeholder="Any special instructions for delivery or pickup..."
                    value={deliveryInfo.specialInstructions}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, specialInstructions: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Delivery Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Available Delivery Dates</Label>
                  <RadioGroup
                    value={deliverySchedule.date}
                    onValueChange={(value) => setDeliverySchedule({ ...deliverySchedule, date: value })}
                  >
                    {deliveryDates.map((date) => (
                      <div key={date.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={date.value} id={date.value} />
                        <Label htmlFor={date.value}>{date.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Time Slot Selection</Label>
                  <RadioGroup
                    value={deliverySchedule.timeSlot}
                    onValueChange={(value) => setDeliverySchedule({ ...deliverySchedule, timeSlot: value })}
                  >
                    {timeSlots.map((slot) => (
                      <div key={slot.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={slot.value} id={slot.value} />
                        <Label htmlFor={slot.value}>{slot.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="special-instructions">Special Delivery Instructions</Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Any special instructions for delivery..."
                    value={deliverySchedule.specialInstructions}
                    onChange={(e) => setDeliverySchedule({ ...deliverySchedule, specialInstructions: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Subscription Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Enable Subscription</Label>
                    <p className="text-sm text-muted-foreground">
                      Get regular deliveries and save money with subscription discounts
                    </p>
                  </div>
                  <Switch
                    checked={subscription.enabled}
                    onCheckedChange={(checked) =>
                      setSubscription({
                        ...subscription,
                        enabled: checked,
                        discount: checked ? getSubscriptionDiscount() : 0,
                      })
                    }
                  />
                </div>

                {subscription.enabled && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-base font-medium mb-3 block">Delivery Frequency</Label>
                      <RadioGroup
                        value={subscription.frequency}
                        onValueChange={(value: "weekly" | "biweekly" | "monthly") =>
                          setSubscription({
                            ...subscription,
                            frequency: value,
                            discount: getSubscriptionDiscount(),
                          })
                        }
                      >
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekly" id="weekly" />
                            <Label htmlFor="weekly" className="font-medium">
                              Weekly
                            </Label>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">Save 15%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="biweekly" id="biweekly" />
                            <Label htmlFor="biweekly" className="font-medium">
                              Bi-weekly
                            </Label>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">Save 10%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className="font-medium">
                              Monthly
                            </Label>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">Save 5%</span>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Subscription Benefits:</strong>
                      </p>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Automatic recurring deliveries</li>
                        <li>• Guaranteed product availability</li>
                        <li>• Easy subscription management</li>
                        <li>• Cancel or modify anytime</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Coupon</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!coupon.applied ? (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={coupon.code}
                      onChange={(e) => setCoupon({ ...coupon, code: e.target.value })}
                    />
                    <Button onClick={handleApplyCoupon} disabled={!coupon.code}>
                      Apply Coupon
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Coupon Applied: {coupon.code}</p>
                      <p className="text-sm text-green-700">You saved ₦{coupon.discount.toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveCoupon}>
                      Remove Coupon
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="flex-1">
                        {item.product.name} × {item.quantity}kg
                      </span>
                      <span>₦{(item.product.pricePerKg * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{getSubtotal().toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>{deliveryInfo.type === "pickup" ? "Pickup Fee" : "Delivery Fee"}</span>
                  <span>₦{getDeliveryFee().toLocaleString()}</span>
                </div>

                {subscription.enabled && getSubscriptionDiscount() > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Subscription Discount ({subscription.frequency})</span>
                    <span>-₦{getSubscriptionDiscount().toLocaleString()}</span>
                  </div>
                )}

                {coupon.applied && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₦{coupon.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Weight</span>
                  <span>{getTotalWeight()}kg</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>₦{getFinalTotal().toLocaleString()}</span>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  className="w-full h-12 text-base font-semibold"
                  disabled={submitting}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {submitting ? "Processing..." : subscription.enabled ? "Setup Subscription" : "Proceed to Payment"}
                </Button>

                {subscription.enabled && (
                  <p className="text-xs text-muted-foreground text-center">
                    You can cancel or modify your subscription anytime after setup
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
