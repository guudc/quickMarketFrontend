import { MapPin, Calendar, Truck } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: "Pick your area",
      description: "Choose from Yaba, Surulere, Ikeja, Lekki 1, Lekki 2, and more",
      number: "1",
    },
    {
      icon: Calendar,
      title: "Choose your plan",
      description: "Select 2, 4, 6, or Unlimited delivery slots per month",
      number: "2",
    },
    {
      icon: Truck,
      title: "Get deliveries",
      description: "Receive your groceries every Thursday or Friday or Saturday",
      number: "3",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-mu ted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We batch orders and buy directly from source to guarantee the lowest prices.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-primary">
                    <span className="text-sm font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/20 transform -translate-y-1/2 z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
