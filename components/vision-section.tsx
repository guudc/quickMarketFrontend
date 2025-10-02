import { TrendingDown, MapPin, Truck } from "lucide-react"

export function VisionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Vision</h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto text-pretty">
            We're making staple foodstuffs in Lagos cheaper, predictable, and accessible. Quick Market exists for people
            who are willing to plan ahead to save significantly on groceries.
          </p>
        </div>

        {/* Infographic */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <TrendingDown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Bulk Sourcing</h3>
            <p className="text-sm text-muted-foreground">Direct from suppliers</p>
          </div>

          <div className="hidden md:block w-12 h-0.5 bg-primary/30"></div>
          <div className="md:hidden h-12 w-0.5 bg-primary/30"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Location-Based Delivery</h3>
            <p className="text-sm text-muted-foreground">Optimized routes</p>
          </div>

          <div className="hidden md:block w-12 h-0.5 bg-primary/30"></div>
          <div className="md:hidden h-12 w-0.5 bg-primary/30"></div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Massive Savings</h3>
            <p className="text-sm text-muted-foreground">Up to 40% off</p>
          </div>
        </div>
      </div>
    </section>
  )
}
