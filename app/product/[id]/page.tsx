"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react"
import { ToastContainer } from "@/components/ui/toast"

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  longDescription: string | null
  basePrice: string
  deliveryFee: string
  unit: string
  stockQuantity: number
  availabilityStatus: string
  mainImageUrl: string
  galleryImages: string[]
  originSource: string | null
  category: {
    name: string
    slug: string
  }
  subcategory: {
    name: string
    slug: string
  } | null
  createdAt: string
}

interface relatedProduct {
  id: string
  name: string
  slug: string
  short_description: string
  base_price: string
  unit: string
  main_image_url: string
}

interface ProductResponse {
  product: Product
  relatedProducts: relatedProduct[]
}


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setrelatedProducts] = useState<relatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; availableIds?: string[] } | null>(null)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [customQuantity, setCustomQuantity] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedLocation] = useState("Yaba")
  const [cart, setCart] = useState<any[]>([])
  const { addToast, toasts, removeToast } = useToast()
  const router = useRouter()

  const quantityOptions = [1, 2, 5, 10, 15, 20, 25]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/products/${params.id}`)
        const data = await response.json()

        if (data.product) {
          setProduct(data.product)
          setrelatedProducts(data.relatedProducts || [])
        } else {
          setError({
            message: data.error || "Product not found",
            availableIds: data.availableIds || [],
          })
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError({
          message: "Failed to load product details. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("quickmarket_cart")
    console.log("[v0] Loading cart from localStorage on product page:", savedCart)
    if (savedCart && savedCart !== "null") {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log("[v0] Parsed cart on product page:", parsedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("[v0] Error parsing cart:", error)
        setCart([])
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCartClick = () => {
    if (!product) return
    setShowAddToCartModal(true)
    setSelectedQuantity(1)
    setCustomQuantity("")
  }

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity)
    setCustomQuantity("")
  }

  const handleCustomQuantityChange = (value: string) => {
    setCustomQuantity(value)
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedQuantity(numValue)
    }
  }

  const handleAddToCartFromModal = () => {
    if (!product) return

    const finalQuantity = customQuantity ? Number.parseInt(customQuantity) : selectedQuantity

    console.log("[v0] Adding to cart - Product:", product?.id, "Quantity:", finalQuantity)

    if (finalQuantity <= 0 || finalQuantity > product?.stockQuantity) {
      addToast({
        title: "Invalid Quantity",
        description: `Please select a quantity between 1 and ${product?.stockQuantity}${product?.unit}.`,
        type: "error",
      })
      return
    }

    const cartItem = {
      productId: product?.id,
      quantity: finalQuantity,
      product: {
        id: product?.id,
        name: product?.name,
        pricePerKg: parseFloat(product?.basePrice), // Convert string to number
        images: [product?.mainImageUrl, ...product?.galleryImages],
        category: product?.category.name,
        stockQty: product?.stockQuantity,
        availabilityStatus: product?.availabilityStatus,
        unit: product?.unit
      },
    }

    console.log("[v0] Cart item to add:", cartItem)

    const updatedCart = [...cart]
    const existingItemIndex = updatedCart.findIndex((item) => item.productId === product?.id)

    if (existingItemIndex >= 0) {
      updatedCart[existingItemIndex].quantity += finalQuantity
      console.log("[v0] Updated existing item quantity:", updatedCart[existingItemIndex].quantity)
    } else {
      updatedCart.push(cartItem)
      console.log("[v0] Added new item to cart")
    }

    console.log("[v0] Updated cart:", updatedCart)

    setCart(updatedCart)
    try {
      localStorage.setItem("quickmarket_cart", JSON.stringify(updatedCart))
      const savedCart = localStorage.getItem("quickmarket_cart")
      console.log("[v0] Saved to localStorage:", savedCart)
    } catch (error) {
      console.error("[v0] Error saving to localStorage:", error)
    }

    addToast({
      type:"info",
      title: "Added to cart",
      description: `${finalQuantity}${product?.unit} of ${product?.name} added to your cart.`,
    })

    setShowAddToCartModal(false)
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getModalTotalPrice = () => {
    if (!product) return 0
    const quantity = customQuantity ? Number.parseInt(customQuantity) : selectedQuantity
    return parseFloat(product?.basePrice) * (isNaN(quantity) ? 0 : quantity)
  }

  // Get all images for the product
  const getAllImages = () => {
    if (!product) return []
    return [product?.mainImageUrl, ...(product?.galleryImages || [])].filter(img => img)
  }

  // Format price display
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString()
  }

  // Get availability badge variant
  const getAvailabilityVariant = () => {
    switch (product?.availabilityStatus) {
      case 'available': return 'default'
      case 'out_of_stock': return 'destructive'
      case 'seasonal': return 'secondary'
      default: return 'outline'
    }
  }

  // Get availability text
  const getAvailabilityText = () => {
    switch (product?.availabilityStatus) {
      case 'available': return 'In Stock'
      case 'out_of_stock': return 'Out of Stock'
      case 'seasonal': return 'Seasonal'
      default: return product?.availabilityStatus || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={getTotalCartItems()} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product && error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={getTotalCartItems()} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The product with ID "{params.id}" doesn't exist or has been removed.
              </p>

              {error.availableIds && error.availableIds.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Try these available products:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {error.availableIds.map((id) => (
                      <Button key={id} variant="outline" size="sm" onClick={() => router.push(`/product/${id}`)}>
                        Product {id}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-x-2">
                <Button onClick={() => router.push("/dashboard")}>Back to Products</Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const images = getAllImages()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={getTotalCartItems()}  />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={images[selectedImageIndex] || "/placeholder.svg"}
                alt={product?.name as string}
                fill
                className="object-cover"
              />
            </div>

            {/* Image Gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border-2 ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product?.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product?.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="outline">{product?.category.name}</Badge>
                {product?.subcategory && (
                  <Badge variant="secondary">{product?.subcategory.name}</Badge>
                )}
                <Badge variant={getAvailabilityVariant()}>
                  {getAvailabilityText()}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.5</span>
                  <span className="text-sm text-muted-foreground">(24 reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-3xl font-bold text-primary">₦{formatPrice(product?.basePrice as any)}</span>
                <span className="text-muted-foreground">per {product?.unit}</span>
              </div>

              {/* Delivery Fee */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <span>+ ₦{formatPrice(product?.deliveryFee as any)} delivery fee</span>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product?.shortDescription || 
                 product?.longDescription || 
                 "Fresh, high-quality produce sourced directly from trusted farmers. Perfect for your daily cooking needs with guaranteed freshness and nutritional value."}
              </p>
            </div>

            {/* Origin Source */}
            {product?.originSource && (
              <div>
                <h3 className="font-semibold mb-2">Origin</h3>
                <p className="text-muted-foreground">{product?.originSource}</p>
              </div>
            )}

            {/* Stock Availability */}
            <div className={`p-4 rounded-lg ${
              product?.availabilityStatus === 'available' ? 'bg-green-50' : 
              product?.availabilityStatus === 'out_of_stock' ? 'bg-red-50' : 'bg-yellow-50'
            }`}>
              <p className={`text-sm font-medium ${
                product?.availabilityStatus === 'available' ? 'text-green-900' : 
                product?.availabilityStatus === 'out_of_stock' ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {getAvailabilityText()}
              </p>
              <p className={`text-sm ${
                product?.availabilityStatus === 'available' ? 'text-green-700' : 
                product?.availabilityStatus === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {product?.stockQuantity} {product?.unit} available
              </p>
            </div>

            <Button 
              onClick={handleAddToCartClick} 
              className="w-full h-12 text-base font-semibold" 
              size="lg"
              disabled={product?.availabilityStatus !== 'available'}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product?.availabilityStatus === 'available' ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct?.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4" onClick={() => router.push(`/product/${relatedProduct?.slug}`)}>
                    <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={relatedProduct?.main_image_url || "/placeholder.svg"}
                        alt={relatedProduct?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold mb-2">{relatedProduct?.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {relatedProduct?.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₦{formatPrice(relatedProduct?.base_price)}
                      </span>
                      <span className="text-sm text-muted-foreground">per {relatedProduct?.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={showAddToCartModal} onOpenChange={setShowAddToCartModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Cart</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center space-x-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product?.mainImageUrl || "/placeholder.svg"}
                    alt={product?.name || "Product image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{product?.name}</h3>
                  <p className="text-sm text-muted-foreground">₦{formatPrice(product?.basePrice as any)}/{product?.unit}</p>
                </div>
              </div>

              {/* Quantity Options */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Quantity ({product?.unit})</Label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {quantityOptions.map((qty) => (
                    <Button
                      key={qty}
                      variant={selectedQuantity === qty && !customQuantity ? "default" : "outline"}
                      onClick={() => handleQuantitySelect(qty)}
                      className="h-10"
                    >
                      {qty}{product?.unit}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Quantity Input */}
              <div>
                <Label htmlFor="custom-qty" className="text-sm font-medium mb-2 block">
                  Or enter custom quantity
                </Label>
                <Input
                  id="custom-qty"
                  type="number"
                  placeholder={`Enter ${product?.unit}`}
                  value={customQuantity}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  min="1"
                  max={product?.stockQuantity}
                />
              </div>

              {/* Price Calculation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Quantity:</span>
                  <span className="font-medium">{customQuantity || selectedQuantity}{product?.unit}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-primary">₦{getModalTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button onClick={handleAddToCartFromModal} className="w-full h-11 font-semibold">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}