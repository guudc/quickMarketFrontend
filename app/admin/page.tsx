"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { useAdminData } from "@/hooks/use-admin";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  MapPin,
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalOrders: number;
    totalSubscriptions: number;
    totalRevenue: string;
    todayRevenue: string;
  };
  ordersByStatus: Record<string, number>;
  subscriptionsByStatus: Record<string, number>;
}

interface RevenueData {
  totalRevenue: string;
  totalSubscriptions: number;
  revenueByLocation: Array<{
    location: string;
    total: number;
    count: number;
  }>;
  revenueByPackage: Array<{
    package: string;
    total: number;
    count: number;
  }>;
}

const locations = [
  "Yaba",
  "Lekki",
  "Ikeja",
  "Surulere",
  "Victoria Island"
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();
  const { isLoggedIn, admin, token } = useAdminData();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/api/admin/dashboard/stats",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
             "ngrok-skip-browser-warning": "true"
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load dashboard statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue data
  const fetchRevenueData = async (location: string = "all") => {
    try {
      setRevenueLoading(true);
      const params = new URLSearchParams();
      if (location !== "all") {
        params.append("location", location.toLowerCase());
      }

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + `/api/admin/revenue?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setRevenueData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch revenue data");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load revenue data",
      });
    } finally {
      setRevenueLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([fetchDashboardStats(), fetchRevenueData()]);
    }
  }, [isLoggedIn]);

  // Refresh revenue data when location changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchRevenueData(selectedLocation);
    }
  }, [selectedLocation, isLoggedIn]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {admin?.firstName} {admin?.lastName}
              </p>
            </div>
            
            {/* Location Filter */}
            <div className="mt-4 sm:mt-0">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full sm:w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(stats?.overview.totalRevenue || 0)
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {selectedLocation === "all" ? "All locations" : selectedLocation}
              </p>
            </CardContent>
          </Card>

          {/* Today's Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(stats?.overview.todayRevenue || 0)
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">Today's earnings</p>
            </CardContent>
          </Card>

          {/* Total Subscriptions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stats?.overview.totalSubscriptions || 0
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Active: {stats?.subscriptionsByStatus?.active || 0}
              </p>
            </CardContent>
          </Card>

          {/* Total Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  stats?.overview.totalOrders || 0
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">All time orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Location */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Location</CardTitle>
              <CardDescription>
                Revenue distribution across locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              ) : revenueData?.revenueByLocation && revenueData.revenueByLocation.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.revenueByLocation.map((location, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium capitalize">{location.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(location.total)}</div>
                        <div className="text-sm text-gray-500">{location.count} subscriptions</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Package */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Package</CardTitle>
              <CardDescription>
                Revenue distribution by subscription packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              ) : revenueData?.revenueByPackage && revenueData.revenueByPackage.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.revenueByPackage.map((pkg, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{pkg.package}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(pkg.total)}</div>
                        <div className="text-sm text-gray-500">{pkg.count} subscriptions</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No package revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Stats Summary</CardTitle>
            <CardDescription>
              Overview of your business performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats?.overview.totalSubscriptions || 0}
                </div>
                <div className="text-sm text-gray-600">Total Subscriptions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.subscriptionsByStatus?.active || 0}
                </div>
                <div className="text-sm text-gray-600">Active Subscriptions</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.overview.totalOrders || 0}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}