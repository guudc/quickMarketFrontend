import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 bg-pri mary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 text-balance">
          Start Planning and Save Big on Groceries
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto text-pretty">
          Join thousands of Lagos residents who are already saving money with Quick Market's smart grocery planning.
        </p>
        <Link href="/auth/login"> 
        <Button
          size="lg"
          className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-3 text-lg font-semibold"
        >
          Join Quick Market Today
        </Button>
        </Link>
      </div>
    </section>
  )
}
