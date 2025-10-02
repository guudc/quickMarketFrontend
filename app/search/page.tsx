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
import { useToast } from "@/components/ui/use-toast"
import type { SearchResult, SearchParams, Product } from "@/lib/search-types"
import { Search, Filter, X, TrendingUp, SlidersHorizontal, Grid3X3, List } from "lucide-react"

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
  { value: "name_desc", label: "Name: Z-A" },
  { value: "stock", label: "Stock Availability" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SearchParams["sortBy"]>("relevance")

  const query = searchParams.get("q") || ""
  const selectedLocation = "Yaba" // This would come from user context

  // Check if order window is open
  const isOrderWindowOpen = () => {
    const today = new Date().getDay()
    return today === 0 || today === 1 // Sunday = 0, Monday = 1
  }

  const orderWindowOpen = isOrderWindowOpen()

  const performSearch = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        ...(query && { query }),
        location: selectedLocation,
        ...(selectedCategories.length > 0 && { categories: selectedCategories.join(",") }),
        priceMin: priceRange[0].toString(),
        priceMax: priceRange[1].toString(),
        ...(selectedAvailability.length > 0 && { availability: selectedAvailability.join(",") }),
        sortBy: sortBy || "relevance",
      })

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setSearchResult(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [query, selectedLocation, selectedCategories, priceRange, selectedAvailability, sortBy, toast])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  // Initialize price range from filters
  useEffect(() => {
    if (searchResult?.filters.priceRange) {
      setPriceRange([searchResult.filters.priceRange.min, searchResult.filters.priceRange.max])
    }
  }, [searchResult?.filters.priceRange])

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = searchResult?.items.find((p) => p.id === productId)
    if (!product) return

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === productId)
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prevCart, { productId, quantity, product }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${quantity}kg of ${product.name} added to your cart.`,
    })
  }

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newQuery) {
      params.set("q", newQuery)
    } else {
      params.delete("q")
    }
    router.push(`/search?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedAvailability([])
    if (searchResult?.filters.priceRange) {
      setPriceRange([searchResult.filters.priceRange.min, searchResult.filters.priceRange.max])
    }
    setSortBy("relevance")
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedAvailability.length > 0 ||
    (searchResult?.filters.priceRange &&
      (priceRange[0] !== searchResult.filters.priceRange.min || priceRange[1] !== searchResult.filters.priceRange.max))

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNavbar
        selectedLocation={selectedLocation}
        cartItemCount={getTotalCartItems()}
        onSearch={handleSearch}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {query ? `Search Results for "${query}"` : "Browse Products"}
              </h1>
              {searchResult && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span>
                    Showing {searchResult.items.length} of {searchResult.totalCount} results
                  </span>
                  <span>•</span>
                  <span>{searchResult.searchTime}ms</span>
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

          {/* Typo Correction */}
          {searchResult?.correctedQuery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Did you mean{" "}
                <button
                  onClick={() => handleSearch(searchResult.correctedQuery!)}
                  className="text-primary hover:underline font-medium"
                >
                  "{searchResult.correctedQuery}"
                </button>
                ?
              </p>
            </div>
          )}

          {/* Search Suggestions */}
          {searchResult?.suggestions && searchResult.suggestions.length > 0 && !query && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchResult.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                    className="h-8 text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SearchParams["sortBy"])}>
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
                {searchResult?.filters.categories && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">Categories</label>
                    <div className="space-y-2">
                      {searchResult.filters.categories.map((category) => (
                        <div key={category.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.value}
                            checked={selectedCategories.includes(category.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category.value])
                              } else {
                                setSelectedCategories(selectedCategories.filter((c) => c !== category.value))
                              }
                            }}
                          />
                          <label htmlFor={category.value} className="text-sm flex-1 cursor-pointer">
                            {category.label}
                          </label>
                          <span className="text-xs text-muted-foreground">({category.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                {searchResult?.filters.priceRange && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Price Range (₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()})
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={searchResult.filters.priceRange.max}
                      min={searchResult.filters.priceRange.min}
                      step={50}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Availability */}
                {searchResult?.filters.availability && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">Availability</label>
                    <div className="space-y-2">
                      {searchResult.filters.availability.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={status.value}
                            checked={selectedAvailability.includes(status.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAvailability([...selectedAvailability, status.value])
                              } else {
                                setSelectedAvailability(selectedAvailability.filter((s) => s !== status.value))
                              }
                            }}
                          />
                          <label htmlFor={status.value} className="text-sm flex-1 cursor-pointer">
                            {status.label}
                          </label>
                          <span className="text-xs text-muted-foreground">({status.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            ) : searchResult && searchResult.items.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
              >
                {searchResult.items.map((product) => (
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
    </div>
  )
}
