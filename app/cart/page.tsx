"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Trash2, ShoppingCart, Package, Truck } from "lucide-react"
import { ToastContainer } from "@/components/ui/toast"

interface CartItem {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    pricePerKg: number
    images: string[]
    category: string
    stockQty: number
    availabilityStatus: string
  }
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cartLoaded, setCartLoaded] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { addToast, toasts, removeToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("quickmarket_cart")
        console.log("[v0] Loading cart from localStorage:", savedCart)

        if (savedCart && savedCart !== "null") {
          const parsedCart = JSON.parse(savedCart)
          console.log("[v0] Parsed cart:", parsedCart)
          setCart(parsedCart)
        } else {
          console.log("[v0] No cart found in localStorage")
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        addToast({
          title: "Error",
          description: "Failed to load cart data. Please refresh the page.",
          type: "error",
        })
      } finally {
        setLoading(false)
        setCartLoaded(true)
      }
    }

    loadCart()
  }, [])

  useEffect(() => {
    if (cartLoaded) {
      console.log("[v0] Saving cart to localStorage:", cart)
      localStorage.setItem("quickmarket_cart", JSON.stringify(cart))
    }
  }, [cart, cartLoaded])

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const removeItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
    addToast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    })
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.pricePerKg * item.quantity, 0)
  }

  const getTotalWeight = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getItemCount = () => {
    return cart.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0}  />
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
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={getTotalWeight()} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout</p>
        </div>

        {cart.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
              <Button onClick={() => router.push("/dashboard")}>Continue Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>

              {cart.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            <p className="text-muted-foreground">₦{item.product.pricePerKg.toLocaleString()}/kg</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-medium w-12 text-center">{item.quantity}kg</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              ₦{(item.product.pricePerKg * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Cart Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Amount</span>
                    <span className="font-semibold">₦{getSubtotal().toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total Weight</span>
                    <span className="font-semibold">{getTotalWeight()}kg</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Item Count</span>
                    <span className="font-semibold">{getItemCount()} items</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{getSubtotal().toLocaleString()}</span>
                  </div>

                  <Button onClick={() => router.push("/checkout")} className="w-full h-12 text-base font-semibold">
                    <Truck className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/dashboard")}>
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast}/>
    </div>
  )
}
