import { Instagram, Twitter, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">Quick Market</h3>
            <p className="text-background/80 mb-4">Smart Planning. Bigger Savings.</p>
            <p className="text-sm text-background/60">
              Making staple foodstuffs in Lagos cheaper, predictable, and accessible for everyone.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-background/80 hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#faqs" className="text-background/80 hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-background/80 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-background/80 hover:text-primary transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-background mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-sm text-background/60">© 2025 Kittchens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
