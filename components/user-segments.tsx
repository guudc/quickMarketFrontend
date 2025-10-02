import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, ShoppingCart } from "lucide-react"

export function UserSegments() {
  const segments = [
    {
      icon: Users,
      title: "Budget-Conscious Households",
      description: "Save more by planning your grocery needs ahead of time.",
    },
    {
      icon: Briefcase,
      title: "Working Professionals",
      description: "Enjoy convenience + affordability delivered to your area.",
    },
    {
      icon: ShoppingCart,
      title: "Bulk Buyers & Group Sharers",
      description: "Split grocery costs with roommates or friends easily.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Who Quick Market is For</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((segment, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <segment.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{segment.title}</h3>
                <p className="text-muted-foreground text-pretty">{segment.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
