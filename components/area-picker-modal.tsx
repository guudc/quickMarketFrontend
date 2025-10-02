"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface AreaPickerModalProps {
  isOpen: boolean
  onAreaSelect: (area: string) => void
}

const LAGOS_AREAS = ["Yaba", "Ikeja", "Surulere", "Lekki Phase One", "Lekki Phase Two"]

export function AreaPickerModal({ isOpen, onAreaSelect }: AreaPickerModalProps) {
  const [selectedArea, setSelectedArea] = useState<string>("")

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area)
    // Store in localStorage for persistence
    localStorage.setItem("quickmarket_selected_area", area)
    onAreaSelect(area)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
            Select Your Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            Choose your area to see accurate pricing and delivery options
          </p>

          <div className="space-y-2">
            <h3 className="font-medium text-center mb-3">Lagos Areas</h3>
            {LAGOS_AREAS.map((area) => (
              <Button
                key={area}
                variant="outline"
                className="w-full justify-start hover:bg-primary hover:text-primary-foreground bg-transparent"
                onClick={() => handleAreaSelect(area)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {area}
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button variant="ghost" disabled className="text-muted-foreground">
              Abuja (Coming Soon)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
