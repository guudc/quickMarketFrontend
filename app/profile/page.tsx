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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  MapPin,
  Calendar,
  Package,
  Shield,
  Settings,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Home,
  Building,
  CheckCircle,
  AlertCircle,
  Globe,
  Bell,
  Lock,
  UserX,
  FileText,
  Camera,
} from "lucide-react"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  phone?: string
  phoneVerified: boolean
  dateOfBirth?: string
  gender?: string
  language: string
  profilePicture?: string
  location: string
  joinedDate: string
  profileCompletion: number
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
    orderUpdates: boolean
    promotionalEmails: boolean
    marketingCommunications: boolean
    dataSharing: boolean
    profileVisibility: string
  }
}

interface Address {
  id: string
  nickname: string
  fullAddress: string
  isDefault: boolean
  type: "residential" | "commercial"
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    language: "English",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  })

  const [addressForm, setAddressForm] = useState({
    nickname: "",
    fullAddress: "",
    isDefault: false,
    type: "residential" as "residential" | "commercial",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch user profile
        const profileResponse = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me")
        const profileData = await profileResponse.json()

        if (profileData.success) {
          const extendedProfile = {
            ...profileData.data,
            emailVerified: true,
            phoneVerified: !!profileData.data.phone,
            dateOfBirth: "",
            gender: "",
            language: "English",
            profilePicture: "",
            profileCompletion: 85,
            preferences: {
              ...profileData.data.preferences,
              orderUpdates: true,
              promotionalEmails: false,
              marketingCommunications: false,
              dataSharing: false,
              profileVisibility: "private",
            },
          }

          setProfile(extendedProfile)
          setEditForm({
            firstName: extendedProfile.firstName,
            lastName: extendedProfile.lastName,
            phone: extendedProfile.phone || "",
            dateOfBirth: extendedProfile.dateOfBirth || "",
            gender: extendedProfile.gender || "",
            language: extendedProfile.language,
          })
        }

        // Fetch addresses
        const addressResponse = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/addresses")
        const addressData = await addressResponse.json()

        if (addressData.success) {
          setAddresses(addressData.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowPasswordForm(false)
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrent: false,
          showNew: false,
          showConfirm: false,
        })
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddAddress = async () => {
    if (!addressForm.nickname.trim() || !addressForm.fullAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressForm),
      })

      const data = await response.json()

      if (data.success) {
        setAddresses([...addresses, data.data])
        setShowNewAddress(false)
        setAddressForm({
          nickname: "",
          fullAddress: "",
          isDefault: false,
          type: "residential",
        })
        toast({
          title: "Address Added",
          description: "Your address has been added successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/users/addresses/${addressId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setAddresses(addresses.filter((addr) => addr.id !== addressId))
        toast({
          title: "Address Deleted",
          description: "Address has been removed successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
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
        setProfile({ ...profile, preferences: updatedPreferences })
        toast({
          title: "Preferences Updated",
          description: "Your preferences have been updated.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-6xl mx-auto px-4 py-8">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your personal information, preferences, and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Header Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-muted-foreground">{profile.email}</p>
                      {profile.emailVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Member since {formatDate(profile.joinedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">Profile Completion</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${profile.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{profile.profileCompletion}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
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
                          dateOfBirth: profile.dateOfBirth || "",
                          gender: profile.gender || "",
                          language: profile.language,
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
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
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
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <select
                      id="gender"
                      value={editForm.gender}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <select
                      id="language"
                      value={editForm.language}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="English">English</option>
                      <option value="Yoruba">Yoruba</option>
                      <option value="Igbo">Igbo</option>
                      <option value="Hausa">Hausa</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{profile.email}</span>
                      {profile.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phone Number</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{profile.phone || "Not provided"}</span>
                      {profile.phone && profile.phoneVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : profile.phone ? (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      ) : null}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                    <span className="font-medium">{profile.dateOfBirth || "Not provided"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <span className="font-medium">{profile.gender || "Not specified"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <span className="font-medium">{profile.language}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address Management</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNewAddress(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {address.type === "residential" ? (
                            <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                          ) : (
                            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{address.nickname}</p>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{address.fullAddress}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No addresses added yet</p>
                </div>
              )}

              {/* Add New Address Form */}
              {showNewAddress && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Add New Address</h4>
                  <div>
                    <Label htmlFor="nickname">Address Nickname *</Label>
                    <Input
                      id="nickname"
                      value={addressForm.nickname}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, nickname: e.target.value }))}
                      placeholder="Home, Office, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullAddress">Full Address *</Label>
                    <Textarea
                      id="fullAddress"
                      value={addressForm.fullAddress}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, fullAddress: e.target.value }))}
                      placeholder="Enter complete address..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddAddress} size="sm">
                      Save Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewAddress(false)
                        setAddressForm({
                          nickname: "",
                          fullAddress: "",
                          isDefault: false,
                          type: "residential",
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Subscription Overview</span>
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
                  <span>Slots Used This Cycle</span>
                  <span>
                    {profile.subscription.slotsUsed} / {profile.subscription.slots}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(profile.subscription.slotsUsed / profile.subscription.slots) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">{profile.subscription.slotsRemaining} slots remaining</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Renewal</span>
                <span className="font-medium">{formatDate(profile.subscription.renewalDate)}</span>
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
                  Pause Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              {showPasswordForm && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={passwordForm.showCurrent ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setPasswordForm((prev) => ({ ...prev, showCurrent: !prev.showCurrent }))}
                      >
                        {passwordForm.showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={passwordForm.showNew ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setPasswordForm((prev) => ({ ...prev, showNew: !prev.showNew }))}
                      >
                        {passwordForm.showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={passwordForm.showConfirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setPasswordForm((prev) => ({ ...prev, showConfirm: !prev.showConfirm }))}
                      >
                        {passwordForm.showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleChangePassword} size="sm">
                      Update Password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                          showCurrent: false,
                          showNew: false,
                          showConfirm: false,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Activity</p>
                  <p className="text-sm text-muted-foreground">View recent login sessions and devices</p>
                </div>
                <Button variant="outline" size="sm">
                  View Activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Communication Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Order confirmations and delivery updates</p>
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
                  <p className="text-sm text-muted-foreground">Text message updates</p>
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
                  <p className="text-sm text-muted-foreground">Updates via WhatsApp</p>
                </div>
                <Switch
                  checked={profile.preferences.whatsappNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("whatsappNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">Promotional offers and newsletters</p>
                </div>
                <Switch
                  checked={profile.preferences.marketingCommunications}
                  onCheckedChange={(checked) => handlePreferenceChange("marketingCommunications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Sharing</p>
                  <p className="text-sm text-muted-foreground">Share data for service improvement</p>
                </div>
                <Switch
                  checked={profile.preferences.dataSharing}
                  onCheckedChange={(checked) => handlePreferenceChange("dataSharing", checked)}
                />
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Profile Visibility</p>
                <select
                  value={profile.preferences.profileVisibility}
                  onChange={(e) => handlePreferenceChange("profileVisibility", e.target.value as any)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <Separator />
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Account Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
                <Button variant="destructive" className="justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Account deletion is permanent and cannot be undone. All your data, orders, and subscription will be
                  permanently removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
