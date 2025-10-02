'use client';

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { VisionSection } from "@/components/vision-section"
import { HowItWorks } from "@/components/how-it-works"
import { UserSegments } from "@/components/user-segments"
import { PricingSection } from "@/components/pricing-section"
import { LocationPackages } from "@/components/location-packages"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { FloatingChat } from "@/components/floating-chat"
import { StickyCTA } from "@/components/sticky-cta"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (city: string, area: string) => void;
}

function LocationPopup({ isOpen, onClose, onLocationSelected }: LocationPopupProps) {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('');

  // Reset when popup opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCity('');
    }
  }, [isOpen]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setStep(2);
  };

  const handleAreaSelect = (area: string) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', selectedCity);
      localStorage.setItem('selectedLocation', area);
    }
    
    // Notify parent component
    onLocationSelected(selectedCity, area);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl shadow-gray-400/40 border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Step 1: City Selection */}
        {step === 1 && (
          <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where are you joining from?
        </h2>
        <p className="text-gray-600 mb-6">Select your city to continue</p>
        
        <div className="space-y-3">
          {/* Lagos - Active */}
          <button
            onClick={() => handleCitySelect('Lagos')}
            className="w-full py-4 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primarytransition-colors shadow-lg"
          >
            Lagos
          </button>
          
          {/* Abuja - Inactive */}
          <button
            disabled
            className="w-full py-4 px-6 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed shadow-lg"
          >
            Abuja (Coming Soon)
          </button>
        </div>
          </div>
        )}

        {/* Step 2: Area Selection */}
        {step === 2 && (
          <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select location in {selectedCity}
        </h2>
        <p className="text-gray-600 mb-6">Choose your area</p>
        
        <div className="space-y-3">
          {['Yaba', 'Lekki Phase One', 'Lekki Phase Two', 'Ikeja', 'Surulere'].map((area) => (
            <button
          key={area}
          onClick={() => handleAreaSelect(area)}
          className="w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-primary/10 transition-all shadow-lg"
            >
          {area}
            </button>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => setStep(1)}
          className="mt-4 text-red-500 font-semibold hover:text-orange-600 transition-colors"
        >
          ← Back to cities
        </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [userLocation, setUserLocation] = useState({ city: '', area: '' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user has already selected location
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('selectedCity');
      const savedArea = localStorage.getItem('selectedLocation');
      
      if (savedCity && savedArea) {
        setUserLocation({ city: savedCity, area: savedArea });
      } else {
        // Show popup after a short delay when page loads
        const timer = setTimeout(() => {
          setShowLocationPopup(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleLocationSelected = (city: string, area: string) => {
    setUserLocation({ city, area });
    setShowLocationPopup(false);
    
    // You can also trigger any other actions here, like analytics
    console.log('User selected:', city, area);
  };

  // Don't render popup during SSR
  if (!isClient) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <HeroSection />
        <VisionSection />
        <HowItWorks />
        <UserSegments />
        <PricingSection />
        <LocationPackages />
        <Testimonials />
        <CTASection />
        <Footer />
        <FloatingChat />
        <StickyCTA />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <VisionSection />
      <HowItWorks />
      <UserSegments />
      <PricingSection />
      <LocationPackages />
      <Testimonials />
      <CTASection />
      <Footer />
      <FloatingChat />
      <StickyCTA />
      
      <LocationPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onLocationSelected={handleLocationSelected}
      />
    </main>
  )
}