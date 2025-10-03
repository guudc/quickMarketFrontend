"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useAdminData } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";

interface PenSize {
  pen_count: number;
  kg_equivalent: number;
  price: number;
  grinding_fee: number;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  long_description: string;
  origin_source: string;
  base_price: number;
  delivery_fee: number;
  unit: string;
  stock_quantity: number;
  availability_status: string;
  main_image_url: string;
  gallery_images: string[];
  active: boolean;
  featured: boolean;
  is_heavy: boolean;
  supports_grinding: boolean;
  categories: {
    name: string;
    slug: string;
  };
  product_pen_sizes: PenSize[];
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const { token } = useAdminData();

  const [categories] = useState([
    {
      id: "6c3d7ab6-af32-476d-a56d-1e886e815187",
      name: "Spices",
    },
    {
      id: "92fd5026-6b71-4ec4-a74f-65860dce1ca3",
      name: "Pasta",
    },
    {
      id: "bad05684-d50c-4b95-93fe-eb1427825c5e",
      name: "Proteins",
    },
    {
      id: "efbd58d3-db2e-45d3-9bcb-fc82cb44f6fc",
      name: "Vegetables",
    },
    {
      id: "f96d50c6-3af4-4148-8353-7999d23687ce",
      name: "Oils",
    },
  ]);

  // Form state for update - only the allowed fields
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    short_description: "",
    long_description: "",
    origin_source: "",
    base_price: "",
    delivery_fee: "",
    unit: "bag",
    stock_quantity: "",
    availability_status: "available",
    main_image_url: "",
    gallery_images: [""],
    active: true,
    featured: false,
    is_heavy: false,
    supports_grinding: false,
  });

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/products/${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "QuickMarket-Admin/1.0",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const productData = data.data;
        setProduct(productData);
        
        // Pre-fill form data for update - only the allowed fields
        setFormData({
          name: productData.name || "",
          slug: productData.slug || "",
          category_id: productData.category_id || "",
          short_description: productData.short_description || "",
          long_description: productData.long_description || "",
          origin_source: productData.origin_source || "",
          base_price: productData.base_price?.toString() || "",
          delivery_fee: productData.delivery_fee?.toString() || "",
          unit: productData.unit || "bag",
          stock_quantity: productData.stock_quantity?.toString() || "",
          availability_status: productData.availability_status || "available",
          main_image_url: productData.main_image_url || "",
          gallery_images: productData.gallery_images || [""],
          active: productData.active ?? true,
          featured: productData.featured ?? false,
          is_heavy: productData.is_heavy ?? false,
          supports_grinding: productData.supports_grinding ?? false,
        });
      } else {
        throw new Error(data.error || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load product details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId && token) {
      fetchProduct();
    }
  }, [productId, token]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug when name changes
    if (field === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value as string),
      }));
    }
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, ""],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
  };

  const handleGalleryImageChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.map((img, i) =>
        i === index ? value : img
      ),
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Only send the allowed fields in the payload
      const payload = {
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id,
        short_description: formData.short_description,
        long_description: formData.long_description,
        origin_source: formData.origin_source,
        base_price: parseFloat(formData.base_price),
        delivery_fee: parseFloat(formData.delivery_fee),
        unit: formData.unit,
        stock_quantity: parseInt(formData.stock_quantity),
        availability_status: formData.availability_status,
        main_image_url: formData.main_image_url,
        gallery_images: formData.gallery_images.filter((img) => img.trim() !== ""),
        active: formData.active,
        featured: formData.featured,
        is_heavy: formData.is_heavy,
        supports_grinding: formData.supports_grinding,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        addToast({
          type: "success",
          title: "Success!",
          description: "Product updated successfully",
        });
        setShowUpdateForm(false);
        fetchProduct(); // Refresh product data
      } else {
        throw new Error(data.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      addToast({
        type: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update product",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        addToast({
          type: "success",
          title: "Success!",
          description: "Product deleted successfully",
        });
        router.push("/admin/products");
      } else {
        throw new Error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast({
        type: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-600">Available</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "seasonal":
        return <Badge className="bg-yellow-600">Seasonal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-1">Product Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowUpdateForm(!showUpdateForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                {showUpdateForm ? "Cancel Update" : "Update Product"}
              </Button>
              <Button 
                onClick={handleDelete}
                variant="destructive"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showUpdateForm ? (
          // Update Form - Only allowed fields
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update the basic details of your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g., Premium Par-Boiled Rice 5 kg"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => handleInputChange("slug", e.target.value)}
                          placeholder="e.g., premium-par-boiled-rice-5kg"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleInputChange("category_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="short_description">Short Description *</Label>
                      <Input
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) => handleInputChange("short_description", e.target.value)}
                        placeholder="Brief description of the product"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="long_description">Long Description</Label>
                      <Textarea
                        id="long_description"
                        value={formData.long_description}
                        onChange={(e) => handleInputChange("long_description", e.target.value)}
                        placeholder="Detailed description of the product"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="origin_source">Origin/Source</Label>
                        <Input
                          id="origin_source"
                          value={formData.origin_source}
                          onChange={(e) => handleInputChange("origin_source", e.target.value)}
                          placeholder="e.g., Nigeria (Benue State)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={formData.unit}
                          onValueChange={(value) => handleInputChange("unit", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bag">Bag</SelectItem>
                            <SelectItem value="kg">Kilogram</SelectItem>
                            <SelectItem value="piece">Piece</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Inventory Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Inventory</CardTitle>
                    <CardDescription>
                      Update pricing and inventory details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base_price">Base Price (₦) *</Label>
                        <Input
                          id="base_price"
                          type="number"
                          value={formData.base_price}
                          onChange={(e) => handleInputChange("base_price", e.target.value)}
                          placeholder="2700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery_fee">Delivery Fee (₦)</Label>
                        <Input
                          id="delivery_fee"
                          type="number"
                          value={formData.delivery_fee}
                          onChange={(e) => handleInputChange("delivery_fee", e.target.value)}
                          placeholder="120"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
                          placeholder="200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability_status">Availability Status</Label>
                        <Select
                          value={formData.availability_status}
                          onValueChange={(value) => handleInputChange("availability_status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Media & Settings */}
              <div className="space-y-6">
                {/* Media Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Media</CardTitle>
                    <CardDescription>Update product images URLs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="main_image_url">Main Image URL *</Label>
                      <Input
                        id="main_image_url"
                        value={formData.main_image_url}
                        onChange={(e) => handleInputChange("main_image_url", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Gallery Images URLs</Label>
                        <Button type="button" onClick={addGalleryImage} size="sm">
                          Add URL
                        </Button>
                      </div>
                      {formData.gallery_images.map((image, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={image}
                            onChange={(e) => handleGalleryImageChange(index, e.target.value)}
                            placeholder="https://example.com/gallery-image.jpg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Settings</CardTitle>
                    <CardDescription>
                      Configure product options and visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Active</Label>
                        <p className="text-sm text-gray-500">Show product in store</p>
                      </div>
                      <Switch
                        checked={formData.active}
                        onCheckedChange={(checked) => handleInputChange("active", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Featured</Label>
                        <p className="text-sm text-gray-500">Highlight this product</p>
                      </div>
                      <Switch
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleInputChange("featured", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Heavy Item</Label>
                        <p className="text-sm text-gray-500">Item requires special handling</p>
                      </div>
                      <Switch
                        checked={formData.is_heavy}
                        onCheckedChange={(checked) => handleInputChange("is_heavy", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Supports Grinding</Label>
                        <p className="text-sm text-gray-500">Can be ground for customer</p>
                      </div>
                      <Switch
                        checked={formData.supports_grinding}
                        onCheckedChange={(checked) => handleInputChange("supports_grinding", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Card */}
                <Card>
                  <CardContent className="p-6">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Updating Product...
                        </>
                      ) : (
                        "Update Product"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        ) : (
          // Product Details View (same as before)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ... Product details view code remains the same ... */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                      <p className="text-lg font-semibold">{product.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Slug</Label>
                      <p className="text-lg">{product.slug}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Category</Label>
                    <p className="text-lg">{product.categories?.name}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Short Description</Label>
                    <p className="text-lg">{product.short_description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Long Description</Label>
                    <p className="text-lg whitespace-pre-wrap">{product.long_description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Origin/Source</Label>
                      <p className="text-lg">{product.origin_source || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Unit</Label>
                      <p className="text-lg capitalize">{product.unit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Base Price</Label>
                      <p className="text-2xl font-bold text-green-600">₦{product.base_price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Delivery Fee</Label>
                      <p className="text-2xl font-bold">₦{product.delivery_fee?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Stock Quantity</Label>
                      <p className="text-2xl font-bold">{product.stock_quantity}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Availability Status</Label>
                      <div className="mt-1">{getAvailabilityBadge(product.availability_status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Media & Status */}
            <div className="space-y-6">
              {/* Product Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Active</Label>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Featured</Label>
                    <Badge variant={product.featured ? "default" : "secondary"}>
                      {product.featured ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Heavy Item</Label>
                    <Badge variant={product.is_heavy ? "default" : "secondary"}>
                      {product.is_heavy ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Supports Grinding</Label>
                    <Badge variant={product.supports_grinding ? "default" : "secondary"}>
                      {product.supports_grinding ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Images */}
              {product.gallery_images && product.gallery_images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {product.gallery_images.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}