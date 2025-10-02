"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ChevronDown,
  Bell,
  ShoppingCart,
  User,
  Package,
  Search,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "@/components/ui/dropdown-ui";
import { SearchBar } from "@/components/search-bar";
import { useUserData } from "@/hooks/use-user";

interface DashboardNavbarProps {
  selectedLocation: string;
  cartItemCount: number;
}

export function DashboardNavbar({
  selectedLocation,
  cartItemCount,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);
  const {isLoggedIn, logout} = useUserData()
  const [isLoaded, setIsLoaded] = useState<Boolean|null>(null)
  const [showMobileSearch, setShowMobileSearch] = useState(false);
 
  useEffect(() => {
    setIsLoaded(true)
  }, [isLoggedIn])
  useEffect(() => {
    // const fetchNotificationCount = async () => {
    //   try {
    //     const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/notifications/unread-count");
    //     const data = await response.json();
    //     if (data.success) {
    //       setNotificationCount(data.data.unreadCount);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching notification count:", error);
    //   }
    // };
    // fetchNotificationCount();
    // const interval = setInterval(fetchNotificationCount, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowMobileSearch(false);
    }  
  };
 
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold text-primary cursor-pointer">
                Quick Market
              </h1>
            </Link>
          </div>

          {/* Location Indicator - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Delivering to</span>
            <span className="font-medium text-foreground">
              {selectedLocation}
            </span>
          </div>

          {/* Enhanced Search Bar - Hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <SearchBar
              onSearch={handleSearchSubmit}
              placeholder="Search for products..."
              className="w-full"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications - Hidden on mobile */}
            {isLoggedIn && isLoaded && (
              <Button
                variant="ghost"
                size="sm"
                className="relative hidden sm:flex"
                onClick={() => router.push("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Cart - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="relative hidden sm:flex"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User Profile Dropdown - Always visible */}
            {isLoggedIn && isLoaded && (
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 w-auto"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </Button>
                }
                side="bottom"
                align="end"
              >
                <DropdownLabel>My Account</DropdownLabel>
                <DropdownSeparator />

                <DropdownItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownItem>

                <DropdownItem onClick={() => router.push("/orders")}>
                  <Package className="mr-2 h-4 w-4" />
                  Order History
                </DropdownItem>

                {/* Notifications in dropdown for mobile access */}
                <DropdownItem onClick={() => router.push("/notifications")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </div>
                    {notificationCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </Badge>
                    )}
                  </div>
                </DropdownItem>

                {/* Cart in dropdown for mobile access */}
                <DropdownItem onClick={() => router.push("/cart")}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                    </div>
                    {cartItemCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </Badge>
                    )}
                  </div>
                </DropdownItem>

                <DropdownItem onClick={() => router.push("/select-location")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Change Location
                </DropdownItem>

                <DropdownSeparator />

                <DropdownItem
                  destructive
                  onClick={() => logout()}
                >
                  Sign Out
                </DropdownItem>
              </Dropdown>
            )}

            {/* Join Now Button */}
            {isLoaded && !isLoggedIn && (
              <Link href="/auth/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 sm:px-6 text-sm sm:text-base">
                  Join Now
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Shows when toggled */}
        {showMobileSearch && (
          <div className="sm:hidden pb-3">
            <SearchBar
              onSearch={handleSearchSubmit}
              placeholder="Search for products..."
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Location Indicator */}
        <div className="sm:hidden flex items-center justify-center space-x-2 text-sm text-muted-foreground pb-2">
          <MapPin className="h-4 w-4" />
          <span>Delivering to</span>
          <span className="font-medium text-foreground">
            {selectedLocation}
          </span>
        </div>
      </div>
    </nav>
  );
}