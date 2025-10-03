"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import type { Product } from "@/lib/search-types"
import { Search, Filter, X, TrendingUp, SlidersHorizontal, Grid3X3, List } from "lucide-react"

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

interface Category {
  name: string
  slug: string
  productCount: number
}

const sortOptions = [
  { value: "name", label: "Name: A-Z" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock", label: "Stock Availability" },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selectedAvailability, setSelectedAvailability] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")

  const query = searchParams.get("search") || ""
  const selectedLocation = "Yaba"

  // Check if order window is open
  const isOrderWindowOpen = () => {
    const today = new Date().getDay()
    return today === 0 || today === 1 || today === 2
  }

  const orderWindowOpen = isOrderWindowOpen()

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      addToast({
        title: "Network error",
        description: "Failed to load categories. Please try again.",
        type: "error",
      })
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        ...(query && { search: query }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedAvailability && { availability: selectedAvailability }),
        page: "1",
        limit: "50"
      })

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        
        // Sort products based on selected sort option
        let sortedProducts = [...data.products]
        switch (sortBy) {
          case "price_asc":
            sortedProducts.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price))
            break
          case "price_desc":
            sortedProducts.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price))
            break
          case "stock":
            sortedProducts.sort((a, b) => b.stock_quantity - a.stock_quantity)
            break
          case "name":
          default:
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
            break
        }
        
        // Filter by price range
        sortedProducts = sortedProducts.filter(product => {
          const price = parseFloat(product.base_price)
          return price >= priceRange[0] && price <= priceRange[1]
        })
        
        setProducts(sortedProducts)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      addToast({
        title: "Network error",
        description: "Failed to load products. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [query, selectedCategory, selectedAvailability, sortBy, priceRange, addToast])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchProducts()])
    }
    loadData()
  }, [fetchProducts])

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId)
      let newCart
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        newCart = [...prevCart, { productId, quantity, product }]
      }

      // Save to localStorage
      localStorage.setItem("quickmarket_cart", JSON.stringify(newCart))
      return newCart
    })

    addToast({
      title: "Added to cart",
      description: `${quantity} of ${product.name} added to your cart.`,
    })
  }

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams()
    if (newQuery) {
      params.set("search", newQuery)
    }
    router.push(`/search?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSelectedCategory("")
    setSelectedAvailability("")
    setPriceRange([0, 10000])
    setSortBy("name")
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const hasActiveFilters = selectedCategory || selectedAvailability || priceRange[0] > 0 || priceRange[1] < 10000

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("quickmarket_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing cart:", error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNavbar
        selectedLocation={selectedLocation}
        cartItemCount={getTotalCartItems()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {query ? `Search Results for "${query}"` : "Browse Products"}
              </h1>
              {products.length > 0 && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span>Showing {products.length} results</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filter Toggle */}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    !
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort Options */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                {!categoriesLoading && categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">Categories</label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.slug} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.slug}
                            checked={selectedCategory === category.slug}
                            onCheckedChange={(checked) => {
                              setSelectedCategory(checked ? category.slug : "")
                            }}
                          />
                          <label htmlFor={category.slug} className="text-sm flex-1 cursor-pointer">
                            {category.name}
                          </label>
                          <span className="text-xs text-muted-foreground">({category.productCount})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Price Range (₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()})
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Availability</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={selectedAvailability === "available"}
                        onCheckedChange={(checked) => {
                          setSelectedAvailability(checked ? "available" : "")
                        }}
                      />
                      <label htmlFor="available" className="text-sm flex-1 cursor-pointer">
                        In Stock
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="out_of_stock"
                        checked={selectedAvailability === "out_of_stock"}
                        onCheckedChange={(checked) => {
                          setSelectedAvailability(checked ? "out_of_stock" : "")
                        }}
                      />
                      <label htmlFor="out_of_stock" className="text-sm flex-1 cursor-pointer">
                        Out of Stock
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square mb-3 rounded-lg" />
                      <Skeleton className="h-4 mb-2" />
                      <Skeleton className="h-3 w-20 mb-2" />
                      <div className="flex justify-between items-center mb-3">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
              >
                {products.map((product:any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isOrderWindowOpen={orderWindowOpen}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {query
                    ? `No results found for "${query}". Try adjusting your search or filters.`
                    : "Try adjusting your filters to see more products."}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}