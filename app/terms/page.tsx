import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auth/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign Up
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>

        {/* Terms Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                By accessing and using Quick Market's services, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Quick Market is an e-grocery platform that provides weekly bulk purchasing services for fresh produce
                and household items. We operate on a subscription-based model with specific order windows and delivery
                schedules.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Order windows: Sunday and Monday only</li>
                <li>Delivery days: Thursday, Friday, and Saturday</li>
                <li>Service areas: Yaba, Lekki 1, Lekki 2, Ikeja, and Surulere</li>
                <li>Minimum order requirements may apply</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                To use our services, you must create an account and provide accurate, complete information. You are
                responsible for maintaining the confidentiality of your account credentials.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>One account per person</li>
                <li>You are responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Orders and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                All orders are subject to availability and acceptance. Prices are subject to change without notice.
                Payment is required at the time of order placement.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Orders can only be placed during designated order windows</li>
                <li>All prices are in Nigerian Naira (₦)</li>
                <li>Payment processing is handled securely through Paystack</li>
                <li>Refunds are subject to our refund policy</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Delivery Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Delivery is available only to specified locations within our service areas. Delivery times are estimates
                and may vary due to traffic, weather, or other factors.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Delivery is available Thursday through Saturday</li>
                <li>You must be available to receive your delivery</li>
                <li>Delivery fees may apply based on location</li>
                <li>We are not responsible for delays beyond our control</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Product Quality and Returns</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We strive to provide fresh, quality products. If you receive damaged or unsatisfactory items, please
                contact us within 24 hours of delivery.
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Report quality issues within 24 hours of delivery</li>
                <li>Provide photos of damaged items when possible</li>
                <li>Refunds or replacements at our discretion</li>
                <li>Perishable items have limited return eligibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We respect your privacy and are committed to protecting your personal information. Please review our
                Privacy Policy for details on how we collect, use, and protect your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Quick Market's liability is limited to the maximum extent permitted by law. We are not liable for
                indirect, incidental, or consequential damages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                posting. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Email: support@quickmarket.ng</li>
                <li>Phone: +234 (0) 123 456 7890</li>
                <li>Address: Lagos, Nigeria</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <Link href="/auth/signup">
            <Button size="lg">I Accept These Terms - Continue to Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
