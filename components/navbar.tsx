"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import useCrypto from "@/hooks/use-crypto";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const isLoggedIn = useCrypto.hasStoredData();

  useEffect(() => {
    async function loadUserData() {
      if (isLoggedIn) setUserData(await useCrypto.retrieveUserData());
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    loadUserData()
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="cursor-pointer">
                <Image
                  src="/meerge-africa-logo.png"
                  alt="meerge Africa | Quick Market"
                  width={200}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - centered */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-baseline space-x-8">
              <Link
                href="/#home"
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="text-foreground hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/#faqs"
                className="text-foreground hover:text-primary transition-colors"
              >
                FAQs
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/auth/login"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            {!isLoggedIn && (
              <Link href="/auth/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  Join Now
                </Button>
              </Link>
            )}
            {isLoggedIn && userData && <>
            <Link href="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                  Dashboard
                </Button>
              </Link>
            </>}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg mt-2">
              <Link
                href="/#home"
                className="block px-3 py-2 text-foreground hover:text-primary"
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 text-foreground hover:text-primary"
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="block px-3 py-2 text-foreground hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/#faqs"
                className="block px-3 py-2 text-foreground hover:text-primary"
              >
                FAQs
              </Link>
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-foreground hover:text-primary"
              >
                Sign In
              </Link>
              <div className="px-3 py-2">
                <Link href="/auth/signup">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                    Join Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
