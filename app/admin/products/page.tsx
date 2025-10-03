"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ToastContainer } from "@/components/ui/toast";
import Link from "next/link";
import { useAdminData } from "@/hooks/use-admin";

// Categories data from your mapping
const categories = [
  {
    id: "6c3d7ab6-af32-476d-a56d-1e886e815187",
    name: "Spices",
    slug: "spices",
    productCount: 0,
  },
  {
    id: "92fd5026-6b71-4ec4-a74f-65860dce1ca3",
    name: "Pasta",
    slug: "pasta",
    productCount: 0,
  },
  {
    id: "bad05684-d50c-4b95-93fe-eb1427825c5e",
    name: "Proteins",
    slug: "proteins",
    productCount: 0,
  },
  {
    id: "efbd58d3-db2e-45d3-9bcb-fc82cb44f6fc",
    name: "Vegetables",
    slug: "vegetables",
    productCount: 0,
  },
  {
    id: "f96d50c6-3af4-4148-8353-7999d23687ce",
    name: "Oils",
    slug: "oils",
    productCount: 0,
  },
];

interface Product {
  id: string;
  name: string;
  short_description: string;
  long_description: string;
  base_price: number;
  main_image_url: string;
  availability_status: string;
  stock_quantity: number;
  categories: {
    name: string;
    slug?: string;
    id:string;
  };
  active: boolean;
  featured: boolean;
  created_at: string;
  product_pen_sizes: Array<{
    price: number;
    pen_count: number;
    kg_equivalent: number;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });
  const { toasts, addToast, removeToast } = useToast();
  const { token, isLoggedIn } = useAdminData();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply filters to products
  const applyFilters = (products: Product[]) => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categories?.id === selectedCategory
      );
    }

    // Availability filter
    if (selectedAvailability) {
      filtered = filtered.filter(
        (product) => product.availability_status === selectedAvailability
      );
    }

    // Search filter (only if we have search query)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.short_description.toLowerCase().includes(query) ||
          product.long_description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Fetch all products from API (only once)
  const fetchAllProducts = async (query:string = "") => {
    try {
      if (!token) return;

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      setLoading(true);

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + `/api/admin/products?limit=1000${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "QuickMarket-Admin/1.0",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "ngrok-skip-browser-warning": "true",
          },
          signal: abortControllerRef.current.signal,
        }
      );

      const data = await response.json();

      if (data.success) {
        const products = data.data || [];
        setAllProducts(products);
        setFilteredProducts(applyFilters(products));
        setPagination({
          page: 1,
          limit: 50,
          total: products.length,
          totalPages: Math.ceil(products.length / 50),
        });
      } else {
        throw new Error(data.error || "Failed to fetch products");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error("Error fetching products:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Load initial data
  useEffect(() => {
    if (isLoggedIn) {
      fetchAllProducts();
    }
  }, [isLoggedIn]);

  // Apply filters when category or availability changes (no API call)
  useEffect(() => {
    if (allProducts.length > 0) {
      const filtered = applyFilters(allProducts);
      setFilteredProducts(filtered);
      setPagination({
        page: 1,
        limit: 50,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 50),
      });
    }
  }, [selectedCategory, selectedAvailability, allProducts]);

  // Handle search with debounce and API call
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // If search is cleared, use the original allProducts
      const filtered = applyFilters(allProducts);
      setFilteredProducts(filtered);
      setPagination({
        page: 1,
        limit: 50,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 50),
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      // For search, we need to make an API call
      fetchAllProducts(`?search=${searchQuery}`);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">In Stock</Badge>
        );
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "seasonal":
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">Seasonal</Badge>
        );
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getMinPrice = (product: Product) => {
    if (product.product_pen_sizes && product.product_pen_sizes.length > 0) {
      return Math.min(...product.product_pen_sizes.map((size) => size.price));
    }
    return product.base_price;
  };

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const currentPageProducts = getCurrentPageProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory and availability
              </p>
            </div>
            <Link href="/admin/products/new">
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search products by name, description..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category:{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedAvailability && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {selectedAvailability.replace("_", " ")}
                  <button
                    onClick={() => setSelectedAvailability("")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allProducts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allProducts.filter((p) => p.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allProducts.filter((p) => p.featured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Out of Stock
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      allProducts.filter(
                        (p) => p.availability_status === "out_of_stock"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : currentPageProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPageProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-gray-400" />
                        )}
                      </div>

                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.short_description}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₦{getMinPrice(product).toLocaleString()}
                          </span>
                          {getAvailabilityBadge(product.availability_status)}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Stock: {product.stock_quantity}</span>
                          <span className="capitalize">
                            {product.categories?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {!product.active && (
                            <Badge
                              variant="outline"
                              className="text-red-500 border-red-200"
                            >
                              Inactive
                            </Badge>
                          )}
                          {product.featured && (
                            <Badge
                              variant="outline"
                              className="text-purple-500 border-purple-200"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Link href={`/admin/products/${product.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Manage
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      filteredProducts.length
                    )}{" "}
                    of {filteredProducts.length} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </p>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory || selectedAvailability
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first product"}
                  </p>
                </div>
                {searchQuery || selectedCategory || selectedAvailability ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setSelectedAvailability("");
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/admin/products/new">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}