"use client"

import { useState, useEffect } from "react" 
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator" 
import {
  Copy,
  Share2,
  MessageCircle,
  Mail,
  QrCode,
  Users,
  TrendingUp,
  Gift,
  Clock,
  CheckCircle,
  ExternalLink,
  Star,
  Award,
} from "lucide-react"
import { type ReferralStats, type ReferralActivity, REFERRAL_REWARDS } from "@/lib/referral-types"

export default function ReferralsPage() { 
  const router = useRouter()
  const [referralCode, setReferralCode] = useState<string>("")
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [activity, setActivity] = useState<ReferralActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchReferralData()
    }
  }, [status, router])

  const fetchReferralData = async () => {
    try {
      setLoading(true)

      // Generate or get existing referral code
      const codeResponse = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/referrals/generate-code", {
        method: "POST",
      })
      const codeData = await codeResponse.json()

      if (codeData.success) {
        setReferralCode(codeData.data.code)
      }

      // Get referral stats
      const statsResponse = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/referrals/stats")
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      // Get referral activity
      const activityResponse = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/referrals/activity")
      const activityData = await activityResponse.json()

      if (activityData.success) {
        setActivity(activityData.data)
      }
    } catch (error) {
      console.error("Error fetching referral data:", error)
     
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      
    } catch (error) {
      
    }
  }

  const shareReferral = async (platform: string) => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/referrals/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          referralCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        window.open(data.data.url, "_blank")
      
      }
    } catch (error) {
  
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "reward_earned":
        return <Gift className="h-4 w-4 text-green-600" />
      case "referral_signup":
        return <Users className="h-4 w-4 text-blue-600" />
      case "referral_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "credit_used":
        return <TrendingUp className="h-4 w-4 text-orange-600" />
      case "referral_sent":
        return <Share2 className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your referral dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
          <p className="text-gray-600">Earn rewards by inviting friends to Quick Market</p>
        </div>

        {/* Referral Code Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-red-600" />
              Your Referral Code
            </CardTitle>
            <CardDescription>Share this code with friends and family to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{referralCode}</div>
                    <p className="text-sm text-gray-600">Your unique referral code</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={copyReferralCode} className="bg-red-600 hover:bg-red-700">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQR(!showQR)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Button
                variant="outline"
                onClick={() => shareReferral("whatsapp")}
                className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => shareReferral("sms")}
                className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <MessageCircle className="h-4 w-4" />
                SMS
              </Button>
              <Button
                variant="outline"
                onClick={() => shareReferral("email")}
                className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() => shareReferral("facebook")}
                className="flex items-center gap-2 text-blue-700 border-blue-700 hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareReferral("twitter")}
                className="flex items-center gap-2 text-sky-600 border-sky-600 hover:bg-sky-50"
              >
                <ExternalLink className="h-4 w-4" />
                Twitter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Credits</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.availableCredits)}</p>
                  </div>
                  <Gift className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lifetime Earnings</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.lifetimeEarnings)}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* How It Works */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Earn rewards by referring friends to Quick Market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 rounded-full p-2 flex-shrink-0">
                      <Share2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">1. Share Your Code</h3>
                      <p className="text-gray-600">
                        Share your unique referral code with friends and family through WhatsApp, SMS, or social media.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">2. Friend Signs Up</h3>
                      <p className="text-gray-600">
                        Your friend creates an account using your referral code and gets NGN 300 off their first order.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                      <Gift className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">3. Both Get Rewards</h3>
                      <p className="text-gray-600">
                        Once your friend completes their first order, you both receive credits that can be used for
                        future purchases.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Reward Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">You earn:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(REFERRAL_REWARDS.REFERRER_REWARD)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Friend saves:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(REFERRAL_REWARDS.REFEREE_REWARD)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus (every 5 referrals):</span>
                      <span className="font-semibold text-purple-600">
                        {formatCurrency(REFERRAL_REWARDS.BONUS_AMOUNT)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIP status after:</span>
                      <span className="font-semibold text-orange-600">{REFERRAL_REWARDS.VIP_THRESHOLD} referrals</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest referral activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      {getActivityIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </div>
                      {item.amount && (
                        <Badge
                          variant={item.amount > 0 ? "default" : "secondary"}
                          className={item.amount > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {item.amount > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(item.amount))}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {activity.length > 5 && (
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Activity
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* VIP Status */}
            {stats && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4">
                      {stats.vipStatus ? (
                        <Star className="h-12 w-12 text-yellow-500 mx-auto" />
                      ) : (
                        <Award className="h-12 w-12 text-gray-400 mx-auto" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {stats.vipStatus ? "VIP Member" : "VIP Status"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {stats.vipStatus
                        ? "Enjoy exclusive perks and priority support!"
                        : `${REFERRAL_REWARDS.VIP_THRESHOLD - stats.successfulReferrals} more referrals to unlock VIP status`}
                    </p>
                    {!stats.vipStatus && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((stats.successfulReferrals / REFERRAL_REWARDS.VIP_THRESHOLD) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
