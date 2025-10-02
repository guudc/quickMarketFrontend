"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Location {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface ApiResponse {
  success: boolean
  data?: Location[]
  error?: string
}

export default function SelectLocationPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchLocations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/locations")
      const data: ApiResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch locations")
      }

      setLocations(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load locations"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId)
  }

  const handleSubmit = async () => {
    if (!selectedLocation) return

    try {
      setIsSubmitting(true)

      const selectedLocationData = locations.find((loc) => loc.id === selectedLocation)

      // Store selected location in localStorage for now
      // In production, this would be sent to your backend
      localStorage.setItem("selectedLocation", JSON.stringify(selectedLocationData))

      toast({
        title: "Location Selected",
        description: `You've selected ${selectedLocationData?.name}. Redirecting to marketplace...`,
      })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to dashboard/marketplace
      router.push("/dashboard")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save location selection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </CardHeader>
          <CardContent>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ErrorState = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to Load Locations</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={fetchLocations} variant="outline">
        <Loader2 className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Select Your Area</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your location to see available packages and pricing
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && <LoadingSkeleton />}

        {error && !isLoading && <ErrorState />}

        {!isLoading && !error && locations.length > 0 && (
          <>
            {/* Location Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedLocation === location.id
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleLocationSelect(location.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {location.name}
                    </CardTitle>
                    <CardDescription>{location.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={selectedLocation === location.id ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLocationSelect(location.id)
                      }}
                    >
                      {selectedLocation === location.id ? "Selected" : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Continue Button */}
            {selectedLocation && (
              <div className="text-center">
                <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="min-w-[200px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Marketplace"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Locations Available</h3>
            <p className="text-muted-foreground">We're currently not serving any locations. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
