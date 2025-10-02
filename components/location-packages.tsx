'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, X } from "lucide-react"
import { useState } from "react"

export function LocationPackages() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const locations = [
    { name: "Yaba Package", area: "Yaba" },
    { name: "Surulere Package", area: "Surulere" },
    { name: "Ikeja Package", area: "Ikeja" },
    { name: "Lekki 1 Package", area: "Lekki Phase 1" },
    { name: "Lekki 2 Package", area: "Lekki Phase 2" },
  ]

  const pricingData = {
    "Yaba": {
      "2 Slots": { 
        price: "NGN 6,000", 
        description: "Can only add 4 times on each slot when purchasing each product" 
      },
      "4 Slots": { 
        price: "NGN 11,000", 
        description: "Can only add 7 times on each slot when purchasing each product" 
      },
      "6 Slots": { 
        price: "NGN 17,000", 
        description: "Can only add 10 times on each slot when purchasing each product" 
      },
      "Unlimited": { 
        price: "NGN 20,000", 
        description: "No limit on the no of items being added" 
      }
    },
    "Lekki Phase 1": {
      "2 Slots": { 
        price: "NGN 7,500", 
        description: "Can only add 4 times on each slot when purchasing each product" 
      },
      "4 Slots": { 
        price: "NGN 14,000", 
        description: "Can only add 7 times on each slot when purchasing each product" 
      },
      "6 Slots": { 
        price: "NGN 20,500", 
        description: "Can only add 10 times on each slot when purchasing each product" 
      },
      "Unlimited": { 
        price: "NGN 25,000", 
        description: "No limit on the no of items being added" 
      }
    },
    "Lekki Phase 2": {
      "2 Slots": { 
        price: "NGN 8,500", 
        description: "Can only add 4 times on each slot when purchasing each product" 
      },
      "4 Slots": { 
        price: "NGN 16,000", 
        description: "Can only add 7 times on each slot when purchasing each product" 
      },
      "6 Slots": { 
        price: "NGN 20,500", 
        description: "Can only add 10 times on each slot when purchasing each product" 
      },
      "Unlimited": { 
        price: "NGN 30,000", 
        description: "No limit on the no of items being added" 
      }
    },
    "Ikeja": {
      "2 Slots": { 
        price: "NGN 5,500", 
        description: "Can only add 4 times on each slot when purchasing each product" 
      },
      "4 Slots": { 
        price: "NGN 10,000", 
        description: "Can only add 7 times on each slot when purchasing each product" 
      },
      "6 Slots": { 
        price: "NGN 14,000", 
        description: "Can only add 10 times on each slot when purchasing each product" 
      },
      "Unlimited": { 
        price: "NGN 20,000", 
        description: "No limit on the no of items being added" 
      }
    },
    "Surulere": {
      "2 Slots": { 
        price: "NGN 6,000", 
        description: "Can only add 4 times on each slot when purchasing each product" 
      },
      "4 Slots": { 
        price: "NGN 11,000", 
        description: "Can only add 7 times on each slot when purchasing each product" 
      },
      "6 Slots": { 
        price: "NGN 17,000", 
        description: "Can only add 10 times on each slot when purchasing each product" 
      },
      "Unlimited": { 
        price: "NGN 20,000", 
        description: "No limit on the no of items being added" 
      }
    }
  }

  const packages = ["2 Slots", "4 Slots", "6 Slots", "Unlimited"];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Location-Based Packages</h2>
          <p className="text-lg text-gray-600">Your package price depends on your area — no hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {locations.map((location, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white border-gray-200"
              onClick={() => setSelectedLocation(location.area)}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
                  <MapPin className="w-6 h-6 text-gray-700" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">{location.area}</p>
                <p className="text-xs text-red-600 mt-2 font-medium hover:text-red-700 transition-colors">View Pricing</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 bg-white-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/40">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/30 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedLocation} Package Pricing
                  </h3>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-gray-500 hover:text-red-600 transition-colors bg-white/80 rounded-full p-1 hover:bg-gray-100"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                          Package
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {packages.map((pkg, index) => {
                        const locationData = pricingData[selectedLocation as keyof typeof pricingData];
                        const packageData = locationData?.[pkg as keyof typeof locationData];
                        
                        if (!packageData) return null;

                        return (
                          <tr 
                            key={pkg} 
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {pkg}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-red-600">
                              {packageData.price}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                              {packageData.description || "Standard package with full features"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-red-600 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• All prices are in Nigerian Naira (NGN)</li>
                    <li>• Packages include access to all platform features</li>
                    <li>• Additional fees may apply for special services</li>
                    <li>• Contact support for custom enterprise solutions</li>
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}