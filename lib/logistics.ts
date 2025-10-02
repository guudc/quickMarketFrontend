// Heavy items that charge 150 naira per item
export const HEAVY_ITEM_LIST = [
  "yam",
  "rice",
  "beans",
  "garri",
  "potato",
  "onion",
  "tomato",
  "plantain",
  "spaghetti",
  "groundnut",
  "palm-oil",
]

export const HEAVY_ITEM_FEE = 150 // per item
export const OTHER_ITEM_FEE = 18 // per item (to be confirmed)

export const PACKAGING_FEES = {
  nylon: 1500,
  carton: 2500,
}

export const GRINDING_FEE = 1200 // per item that needs grinding

export interface CartItem {
  productId: string
  name: string
  quantity: number
  isHeavy: boolean
  needsGrinding?: boolean
  packagingType?: "nylon" | "carton"
}

export function calculateLogistics(cart: CartItem[]): number {
  let total = 0

  cart.forEach((item) => {
    if (item.isHeavy) {
      total += HEAVY_ITEM_FEE * item.quantity
    } else {
      total += OTHER_ITEM_FEE * item.quantity
    }
  })

  return total
}

export function calculatePackagingFee(packagingType?: "nylon" | "carton"): number {
  if (!packagingType) return 0
  return PACKAGING_FEES[packagingType]
}

export function calculateGrindingFee(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    return total + (item.needsGrinding ? GRINDING_FEE * item.quantity : 0)
  }, 0)
}
