"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  CreditCard,
  Bell,
  Shield,
  FileText,
  Settings,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location: string
  isVerified: boolean
  joinedDate: string
  subscription: {
    id: string
    packageName: string
    slots: number
    slotsUsed: number
    slotsRemaining: number
    renewalDate: string
    isActive: boolean
  }
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    deliveryReminders: boolean
  }
  paymentMethods: Array<{
    id: string
    type: string
    last4: string
    brand: string
    isDefault: boolean
  }>
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me")
        const data = await response.json()

        if (data.success) {
          setProfile(data.data)
          setEditForm({
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            phone: data.data.phone || "",
          })
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setEditingProfile(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!profile) return

    try {
      const updatedPreferences = {
        ...profile.preferences,
        [key]: value,
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: updatedPreferences }),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been updated.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getUsagePercentage = () => {
    if (!profile?.subscription) return 0
    return (profile.subscription.slotsUsed / profile.subscription.slots) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
              <p className="text-muted-foreground mb-6">Unable to load your profile information.</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Management</h1>
          <p className="text-muted-foreground">Manage your profile, subscription, and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                {!editingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(false)
                        setEditForm({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          phone: profile.phone || "",
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{profile.email}</p>
                        {profile.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{profile.phone || "Not provided"}</p>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{profile.location}</p>
                      <p className="text-sm text-muted-foreground">Location</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(profile.joinedDate)}</p>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Subscription Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{profile.subscription.packageName}</p>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                </div>
                <Badge variant={profile.subscription.isActive ? "default" : "secondary"}>
                  {profile.subscription.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Slots Used</span>
                  <span>
                    {profile.subscription.slotsUsed} / {profile.subscription.slots}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.subscription.slotsRemaining} slots remaining this cycle
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Next Renewal</p>
                  <p className="text-xs text-muted-foreground">{formatDate(profile.subscription.renewalDate)}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push("/subscribe")}
                >
                  Change Plan
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {profile.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground">
                            {method.type === "card" ? "Credit Card" : method.type}
                          </p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment methods added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive order updates via email</p>
              </div>
              <Switch
                checked={profile.preferences.emailNotifications}
                onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive order updates via SMS</p>
              </div>
              <Switch
                checked={profile.preferences.smsNotifications}
                onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WhatsApp Notifications</p>
                <p className="text-sm text-muted-foreground">Receive order updates via WhatsApp</p>
              </div>
              <Switch
                checked={profile.preferences.whatsappNotifications}
                onCheckedChange={(checked) => handlePreferenceChange("whatsappNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delivery Reminders</p>
                <p className="text-sm text-muted-foreground">Get reminded about upcoming deliveries</p>
              </div>
              <Switch
                checked={profile.preferences.deliveryReminders}
                onCheckedChange={(checked) => handlePreferenceChange("deliveryReminders", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Account Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MapPin className="h-4 w-4 mr-2" />
                Update Delivery Address
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Legal & Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Terms of Service
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
