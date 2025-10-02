"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  MapPin,
  Users,
  TrendingDown,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { ToastContainer } from "@/components/ui/toast";
import { useUserData } from "@/hooks/use-user";
import Link from "next/link";

interface Category {
  name: string;
  slug: string;
  productCount: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: any;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [selectedLocation, setSelectedLocation] = useState<string>("Yaba");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { isLoggedIn, user, subscription } = useUserData();
  const { toasts, addToast, removeToast } = useToast();
  const router = useRouter();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(selectedCategory !== "All Items" && { 
          category: selectedCategory.toLowerCase().replace(/\s+/g, '-') 
        }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/products?${params}`);
      const data = await response.json();
      if (data) {
        setProducts(data.products);
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchCategories(), fetchProducts()]);
    };
    loadInitialData();
  }, []);

  // Refresh products when category or search changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Load selected location from localStorage
  useEffect(() => {
    const loadSelectedLocation = () => {
      try {
        const savedLocation = localStorage.getItem("selectedLocation");
        if (savedLocation) {
          const locationName = savedLocation;
          setSelectedLocation(locationName || "Yaba");
        }
      } catch (error) {
        console.error("Error loading selected location:", error);
      }
    };
    loadSelectedLocation();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("quickmarket_cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("quickmarket_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const isOrderWindowOpen = () => {
    const today = new Date().getDay();
    return today === 0 || today === 1 || today === 2 || true; // Sunday = 0, Monday = 1, Tuesday = 2
  };

  const orderWindowOpen = isOrderWindowOpen();

  // Prepare categories for display with "All Items" option
  const displayCategories = [
    { 
      name: "All Items", 
      slug: "all", 
      productCount: categories.reduce((total, cat) => total + cat.productCount, 0) 
    },
    ...categories.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount
    }))
  ];

  const handleAddToCart = (productId: string, quantity: number) => {
    console.log("Dashboard handleAddToCart called:", productId, quantity);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      console.error("Product not found:", productId);
      return;
    }

    try {
      setCart((prevCart) => {
        console.log("Previous cart:", prevCart);
        const existingItem = prevCart.find(
          (item) => item.productId === productId
        );
        let newCart;
        if (existingItem) {
          newCart = prevCart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...prevCart, { productId, quantity, product }];
        }

        console.log("New cart:", newCart);
        console.log("Saving cart to localStorage:", newCart);
        localStorage.setItem("quickmarket_cart", JSON.stringify(newCart));
        return newCart;
      });

      try {
        addToast({
          title: "Added to cart",
          description: `${quantity}kg of ${product.name} added to your cart.`,
        });
      } catch (toastError) {
        console.error("Toast error:", toastError);
        console.log("Item added to cart successfully (toast failed)");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      try {
        addToast({
          type: "error",
          description: "Failed to add item to cart. Please try again.",
          title: "Cart error",
        });
      } catch (toastError) {
        console.error("Toast error in catch block:", toastError);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartValue = () => {
    return cart.reduce(
      (total, item) => total + item.product.pricePerKg * item.quantity,
      0
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNavbar
        selectedLocation={selectedLocation}
        cartItemCount={getTotalCartItems()}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero/Welcome Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome to Quick Market - {selectedLocation}
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              {orderWindowOpen ? (
                <Badge
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Order window is OPEN - Place orders now!
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Order window CLOSED - Next window opens Sunday
                </Badge>
              )}
            </div>
            {/* 🔥 CHANGE: Bold + highlighted section */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm bg-yellow-100 px-4 py-2 rounded-md font-bold text-yellow-900">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Serving 5 Lagos Areas</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="h-4 w-4" />
                <span>Save up to 40%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>Weekly Deliveries</span>
              </div>
            </div>
          </div>
          {isLoggedIn && user && !user.emailVerified && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm bg-red-100 px-4 py-2 rounded-md font-bold text-red-900">
             <p className="font-medium text-center">
                    Please verify your email address to place orders.
                  </p>
                  <Link href={"/auth/verify"}>Send Email</Link>
            </div>  
          )}

          {/* Order Window Reminder Banner */}
          {!orderWindowOpen && (
            <Card className="bg-yellow-50 border-yellow-200 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  <p className="font-medium">
                    Order window is currently closed. You can browse products
                    but cannot place orders until Sunday.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscription Status & Slot Management */}
        {isLoggedIn && user && subscription && (<div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {subscription?.status}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/subscribe")}
                >
                  Upgrade Plan
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{subscription?.totalSlots}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Delivery Slots
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{subscription?.slotsUsed}</div>
                  <div className="text-sm text-muted-foreground">
                    Delivery Slots Used
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{subscription?.slotsRemaining}</div>
                  <div className="text-sm text-muted-foreground">
                    Delivery Slots Remaining
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Delivery Slot Usage</span>
                  <span>{subscription?.slotsUsed}/{subscription?.totalSlots} slots</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                    <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${subscription?.totalSlots
                      ? Math.round(
                        (subscription.slotsUsed / subscription.totalSlots) * 100
                        )
                      : 0}%`,
                    }}
                    ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>)}

        {/* Category Filter Section */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categoriesLoading ? (
              // Skeleton loading for categories
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
              ))
            ) : (
              displayCategories.filter(category => category.productCount > 0).map((category) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="whitespace-nowrap flex items-center gap-2"
                  size="sm"
                >
                  {category.name}
                  <Badge variant="secondary" className="text-xs">
                    {category.productCount}
                  </Badge>
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
              <div className="text-muted-foreground mb-4">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">No products found</p>
                <p className="text-sm">
                  Try adjusting your search or category filter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      {getTotalCartItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Button className="w-full h-12 text-base font-semibold shadow-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({getTotalCartItems()} items) - ₦
            {getTotalCartValue().toLocaleString()}
          </Button>
        </div>
      )}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}