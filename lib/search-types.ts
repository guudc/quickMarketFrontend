export interface SearchParams {
  query?: string
  categories?: string[]
  priceMin?: number
  priceMax?: number
  availability?: string[]
  sortBy?: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "stock" | "newest" | "popular"
  page?: number
  limit?: number
  location?: string
}

export interface SearchResult {
  items: Product[]
  totalCount: number
  filters: AvailableFilters
  suggestions?: string[]
  correctedQuery?: string
  searchTime: number
}

export interface AvailableFilters {
  categories: FilterOption[]
  priceRange: {
    min: number
    max: number
  }
  availability: FilterOption[]
  locations: FilterOption[]
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface SearchSuggestion {
  text: string
  type: "product" | "category" | "popular"
  count?: number
}

export interface SearchHistory {
  query: string
  timestamp: number
  resultCount: number
}

export interface Product {
  id: string
  name: string
  category: string
  pricePerKg: number
  stockQty: number
  availabilityStatus: "Available" | "Out of Stock" | "Seasonal"
  images: string[]
  description: string
  location: string
  popularity?: number
  createdAt?: string
}
