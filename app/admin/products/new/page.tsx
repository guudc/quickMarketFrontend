"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useAdminData } from "@/hooks/use-admin";

interface PenSize {
  pen_count: number;
  kg_equivalent: number;
  price: number;
  grinding_fee: number;
  is_available: boolean;
}

interface LocationPricing {
  location: string;
  price: number;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { token } = useAdminData();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    short_description: "",
    long_description: "",
    origin_source: "",
    base_price: "",
    delivery_fee: "",
    unit: "pen",
    stock_quantity: "",
    availability_status: "available",
    main_image_url: "",
    gallery_images: [""],
    active: true,
    featured: false,
    is_heavy: false,
    supports_grinding: false,
  });

  const [penSizes, setPenSizes] = useState<PenSize[]>([
    {
      pen_count: 1,
      kg_equivalent: 3.0,
      price: 0,
      grinding_fee: 0,
      is_available: true,
    },
  ]);

  const [locationPricing, setLocationPricing] = useState<LocationPricing[]>([
    { location: "Yaba", price: 0, active: true },
    { location: "Lekki", price: 0, active: true },
    { location: "Ikeja", price: 0, active: true },
    { location: "Surulere", price: 0, active: true },
    { location: "Victoria Island", price: 0, active: true },
  ]);

  // Fetch categories on component mount
  useState(() => {
    // const fetchCategories = async () => {
    //   try {
    //     setCategoriesLoading(true);
    //     const response = await fetch(
    //       process.env.NEXT_PUBLIC_API_BASE_URL + "/api/categories"
    //     );
    //     const data = await response.json();

    //     if (data.success) {
    //       setCategories(data.categories);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching categories:", error);
    //     addToast({
    //       type: "error",
    //       title: "Error",
    //       description: "Failed to load categories",
    //     });
    //   } finally {
    //     setCategoriesLoading(false);
    //   }
    // };
    setCategoriesLoading(false);
  });

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

  const handlePenSizeChange = (
    index: number,
    field: keyof PenSize,
    value: any
  ) => {
    setPenSizes((prev) =>
      prev.map((size, i) => (i === index ? { ...size, [field]: value } : size))
    );
  };

  const addPenSize = () => {
    setPenSizes((prev) => [
      ...prev,
      {
        pen_count: prev.length + 1,
        kg_equivalent: 3.0,
        price: 0,
        grinding_fee: 0,
        is_available: true,
      },
    ]);
  };

  const removePenSize = (index: number) => {
    if (penSizes.length > 1) {
      setPenSizes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleLocationPriceChange = (index: number, price: number) => {
    setLocationPricing((prev) =>
      prev.map((location, i) =>
        i === index ? { ...location, price } : location
      )
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        delivery_fee: parseFloat(formData.delivery_fee),
        stock_quantity: parseInt(formData.stock_quantity),
        gallery_images: formData.gallery_images.filter(
          (img) => img.trim() !== ""
        ),
        pen_sizes: penSizes,
        location_pricing: locationPricing,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/products`,
        {
          method: "POST",
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
          description: "Product created successfully",
        });
        router.push("/admin/products");
      } else {
        throw new Error(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      addToast({
        type: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create product",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new product for your inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="e.g., Premium Millets"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          handleInputChange("slug", e.target.value)
                        }
                        placeholder="e.g., premium-millets"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        handleInputChange("category_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading categories...
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_description">
                      Short Description *
                    </Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) =>
                        handleInputChange("short_description", e.target.value)
                      }
                      placeholder="Brief description of the product"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long_description">Long Description</Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description}
                      onChange={(e) =>
                        handleInputChange("long_description", e.target.value)
                      }
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
                        onChange={(e) =>
                          handleInputChange("origin_source", e.target.value)
                        }
                        placeholder="e.g., Local Farm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          handleInputChange("unit", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pen">Paint</SelectItem>
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
                    Set pricing and inventory details
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
                        onChange={(e) =>
                          handleInputChange("base_price", e.target.value)
                        }
                        placeholder="5000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_fee">Delivery Fee (₦)</Label>
                      <Input
                        id="delivery_fee"
                        type="number"
                        value={formData.delivery_fee}
                        onChange={(e) =>
                          handleInputChange("delivery_fee", e.target.value)
                        }
                        placeholder="150"
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
                        onChange={(e) =>
                          handleInputChange("stock_quantity", e.target.value)
                        }
                        placeholder="100"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability_status">
                        Availability Status
                      </Label>
                      <Select
                        value={formData.availability_status}
                        onValueChange={(value) =>
                          handleInputChange("availability_status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="out_of_stock">
                            Out of Stock
                          </SelectItem>
                          <SelectItem value="discontinued">
                            Discontinued
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pen Sizes Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Paint Sizes</CardTitle>
                      <CardDescription>
                        Configure different paint sizes and their pricing
                      </CardDescription>
                    </div>
                    <Button type="button" onClick={addPenSize} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Size
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {penSizes.map((size, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Paint Size {size.pen_count}
                        </h4>
                        {penSizes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePenSize(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Paint Count</Label>
                          <Input
                            type="number"
                            value={size.pen_count}
                            onChange={(e) =>
                              handlePenSizeChange(
                                index,
                                "pen_count",
                                parseInt(e.target.value)
                              )
                            }
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>KG Equivalent</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={size.kg_equivalent}
                            onChange={(e) =>
                              handlePenSizeChange(
                                index,
                                "kg_equivalent",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (₦)</Label>
                          <Input
                            type="number"
                            value={size.price}
                            onChange={(e) =>
                              handlePenSizeChange(
                                index,
                                "price",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grinding Fee (₦)</Label>
                          <Input
                            type="number"
                            value={size.grinding_fee}
                            onChange={(e) =>
                              handlePenSizeChange(
                                index,
                                "grinding_fee",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={size.is_available}
                          onCheckedChange={(checked) =>
                            handlePenSizeChange(index, "is_available", checked)
                          }
                        />
                        <Label>Available for purchase</Label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Location Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Pricing</CardTitle>
                  <CardDescription>
                    Set different prices for each location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locationPricing.map((location, index) => (
                    <div
                      key={location.location}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-32">
                        <Label>{location.location}</Label>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={location.price}
                          onChange={(e) =>
                            handleLocationPriceChange(
                              index,
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="Price for this location"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={location.active}
                          onCheckedChange={(checked) => {
                            setLocationPricing((prev) =>
                              prev.map((loc, i) =>
                                i === index ? { ...loc, active: checked } : loc
                              )
                            );
                          }}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Media & Settings */}
            <div className="space-y-6">
              {/* Media Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                  <CardDescription>Add product images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="main_image_url">Main Image URL *</Label>
                    <Input
                      id="main_image_url"
                      value={formData.main_image_url}
                      onChange={(e) =>
                        handleInputChange("main_image_url", e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Gallery Images</Label>
                      <Button type="button" onClick={addGalleryImage} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                    {formData.gallery_images.map((image, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={image}
                          onChange={(e) =>
                            handleGalleryImageChange(index, e.target.value)
                          }
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
                      <p className="text-sm text-gray-500">
                        Show product in store
                      </p>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        handleInputChange("active", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Featured</Label>
                      <p className="text-sm text-gray-500">
                        Highlight this product
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        handleInputChange("featured", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Heavy Item</Label>
                      <p className="text-sm text-gray-500">
                        Item requires special handling
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_heavy}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_heavy", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Supports Grinding</Label>
                      <p className="text-sm text-gray-500">
                        Can be ground for customer
                      </p>
                    </div>
                    <Switch
                      checked={formData.supports_grinding}
                      onCheckedChange={(checked) =>
                        handleInputChange("supports_grinding", checked)
                      }
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Product...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
