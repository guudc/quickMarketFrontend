"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ToastContainer } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { validateSignInForm } from "@/lib/auth-validation"
import type { SignInFormData, FormErrors } from "@/lib/auth-types"
import useCrypto from "@/hooks/use-crypto"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react"
import { useAdminData } from "@/hooks/use-admin"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  // { name: "Users", href: "/admin/users", icon: Users },
  // { name: "Locations", href: "/admin/locations", icon: MapPin },
  // { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const {isLoggedIn, admin, logout} = useAdminData()
 
  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        setIsAuthenticated(isLoggedIn)
        // Show login modal if not authenticated
        if (!isLoggedIn) {
          setShowLoginModal(true)
        }
        else{
          setShowLoginModal(false)
        }
      }
    }

    checkAuth()

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [pathname, router, isLoggedIn])

  const handleInputChange = (
    field: keyof SignInFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateSignInForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      const { rememberMe, ...submitData } = formData
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })
      const {data, success} = await response.json()
      if (response.ok && success) {
        // Handle successful sign-in
        addToast({
          type: "success",
          title: `Welcome back, ${data?.user?.firstName}!`,
          description: "You have been signed in successfully.",
        })
        // Store the token and user data
        useCrypto.storeUserData(data)
        setIsAuthenticated(true)
        setShowLoginModal(false)
        router.push("/admin")
      } else {
        addToast({
          type: "error",
          title: "Admin sign in failed",
          description: data?.error || "Invalid admin credentials",
        })
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Sign in failed",
        description: "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      logout()
      setIsAuthenticated(false)
      setShowLoginModal(true)
      addToast({
        type: "success",
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    }
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white-600 bg-opacity-50 p-4">
          <div className="w-full max-w-md">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">QM</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Portal</CardTitle>
                      <CardDescription>Secure access required</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLoginModal(false)}
                    disabled={!isAuthenticated} // Only allow closing if authenticated
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@quickmarket.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-destructive" : ""}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                      <p id="password-error" className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          handleInputChange("rememberMe", checked as boolean)
                        }
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    {/* <Link
                      href="/admin/forgot-password"
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => e.preventDefault()} // Prevent navigation for demo
                    >
                      Forgot password?
                    </Link> */}
                  </div>

                  <Button 
                    type="submit"   
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign in as Admin"
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Return to{" "}
                    <Link href="/" className="text-primary hover:underline font-medium">
                      main site
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Admin Layout (only shown when authenticated) */}
      {isAuthenticated && (
        <div className="flex h-screen">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-white-400 bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div
            className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">QM</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Quick Market</h1>
                    {isLoggedIn && (<p className="text-xs text-gray-500">{admin?.firstName} {admin?.lastName}</p>)}
                  </div>
                </Link>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Admin user info */}
              <div className="p-4 border-t border-gray-200">
                 <div 
                      className="text-red-400 cursor-pointer flex items-center"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge
                      variant="default"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      3
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>

            {/* Page content - scrollable area */}
            <div className="flex-1 overflow-auto">
              <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}