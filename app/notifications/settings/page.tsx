"use client"

import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, MessageSquare, Phone, Settings, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  deliveryReminders: boolean
  orderUpdates: boolean
  promotionalEmails: boolean
  orderWindowAlerts: boolean
  subscriptionReminders: boolean
  systemUpdates: boolean
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me")
        const data = await response.json()

        if (data.success) {
          // Extend existing preferences with additional notification settings
          setPreferences({
            emailNotifications: data.data.preferences.emailNotifications,
            smsNotifications: data.data.preferences.smsNotifications,
            whatsappNotifications: data.data.preferences.whatsappNotifications,
            deliveryReminders: data.data.preferences.deliveryReminders,
            // Additional settings with defaults
            orderUpdates: true,
            promotionalEmails: false,
            orderWindowAlerts: true,
            subscriptionReminders: true,
            systemUpdates: true,
          })
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load notification preferences.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    setPreferences((prev) => ({
      ...prev!,
      [key]: value,
    }))
  }

  const handleSavePreferences = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Preferences Saved",
          description: "Your notification preferences have been updated successfully.",
          type: "success",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to load preferences</h2>
              <p className="text-muted-foreground mb-6">Please try refreshing the page.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notifications
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Customize how and when you receive notifications from Quick Market</p>
        </div>

        <div className="space-y-8">
          {/* Communication Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Communication Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">WhatsApp Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.whatsappNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("whatsappNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order & Delivery Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Order & Delivery Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications about order confirmation, preparation, and status changes
                  </p>
                </div>
                <Switch
                  checked={preferences.orderUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange("orderUpdates", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delivery Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Reminders about upcoming deliveries and delivery windows
                  </p>
                </div>
                <Switch
                  checked={preferences.deliveryReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("deliveryReminders", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Window Alerts</p>
                  <p className="text-sm text-muted-foreground">Alerts when order windows are opening or closing soon</p>
                </div>
                <Switch
                  checked={preferences.orderWindowAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange("orderWindowAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Account Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Subscription Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications about subscription renewals, slot usage, and plan changes
                  </p>
                </div>
                <Switch
                  checked={preferences.subscriptionReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("subscriptionReminders", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Important system maintenance, security updates, and service announcements
                  </p>
                </div>
                <Switch
                  checked={preferences.systemUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange("systemUpdates", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Communications */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotional Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Special offers, new product announcements, and marketing content
                  </p>
                </div>
                <Switch
                  checked={preferences.promotionalEmails}
                  onCheckedChange={(checked) => handlePreferenceChange("promotionalEmails", checked)}
                />
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You can unsubscribe from promotional emails at any time. Essential service notifications will still be
                  sent regardless of this setting.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} disabled={saving} className="min-w-32">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
