"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "./ui/toast";

interface Product {
  id: string
  name: string
  category_name: string
  base_price: number
  stock_quantity: number
  availability_status: "Available" | "Out of Stock" | "Seasonal"
  main_image_url: string
  short_description: string
  location: string
  slug: string
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
  isOrderWindowOpen: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isOrderWindowOpen,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (
      !isOrderWindowOpen ||
      product.stock_quantity === 0 ||
      product.availability_status === "Out of Stock"
    ) {
      return;
    }

    setIsAdding(true);
    try {
      console.log("Adding to cart:", product.id, quantity);
      onAddToCart(product.id, quantity);
      setQuantity(1); // Reset quantity after adding
      console.log("Successfully added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      try {
        addToast({
          type: "error",
          description: "Failed to add item to cart. Please try again.",
          title: "Cart error",
        });
      } catch (toastError) {
        console.error("Toast error:", toastError);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleProductClick = () => {
    router.push(`/product/${product.slug}`);
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0)
      return { text: "Out of Stock", variant: "destructive" as const };
    if (product.stock_quantity < 20)
      return { text: "Low Stock", variant: "secondary" as const };
    return { text: "In Stock", variant: "default" as const };
  };

  const getAvailabilityColor = () => {
    switch (product.availability_status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Seasonal":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stockStatus = getStockStatus();
  const isDisabled =
    !isOrderWindowOpen ||
    product.stock_quantity === 0 ||
    product.availability_status === "Out of Stock";
 
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Product Image */}
        <div
          className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
          onClick={handleProductClick}
        >
          <Image
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {/* Availability Badge */}
          <Badge
            className={`absolute top-2 right-2 text-xs ${getAvailabilityColor()}`}
          >
            {product.availability_status}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div>
            <h3
              className="font-semibold text-sm line-clamp-2 text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={handleProductClick}
            >
              {product.name}
            </h3>
            <Badge variant="outline" className="text-xs mt-1">
              {product.category_name}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">
                ₦{product.base_price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">per kg</p>
            </div>
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.text}
            </Badge>
          </div>

          {/* Quantity Selector */}
          {!isDisabled && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isAdding}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-8 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={isAdding}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isDisabled || isAdding}
            className="w-full text-sm"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAdding
              ? "Adding..."
              : isDisabled
              ? "Unavailable"
              : "Add to Cart"}
          </Button>

          {!isOrderWindowOpen && (
            <p className="text-xs text-muted-foreground text-center">
              Order window closed
            </p>
          )}
        </div>
      </CardContent>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Card>
  );
}
