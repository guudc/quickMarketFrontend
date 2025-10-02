export interface Location {
  id: string
  name: string
  description: string
  isActive: boolean
}

export interface LocationApiResponse {
  success: boolean
  data?: Location[]
  error?: string
}

export interface LocationSelectionState {
  selectedLocation: Location | null
  isLoading: boolean
  error: string | null
}
