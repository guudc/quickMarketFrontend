export interface Package {
  id: string
  name: string
  slots: number
  price: number
  quantityLimits: {
    perItemMax: number
  }
  locationId: string
  features: string[]
  isPopular?: boolean
}

export interface PackageApiResponse {
  success: boolean
  data?: Package[]
  error?: string
}

export interface PaymentInitRequest {
  email: string
  amount: number
  packageId: string
  locationId: string
}

export interface PaymentInitResponse {
  success: boolean
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
  error?: string
}
