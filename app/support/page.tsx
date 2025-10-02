"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Phone, Mail, HelpCircle, Search, ExternalLink, Send, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  name: string
  count: number
}

interface FAQData {
  faqs: FAQ[]
  categories: FAQCategory[]
}

interface SupportFormData {
  type: string
  subject: string
  message: string
  orderId?: string
  priority: string
}

export default function SupportPage() {
  const [faqData, setFaqData] = useState<FAQData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [formData, setFormData] = useState<SupportFormData>({
    type: "",
    subject: "",
    message: "",
    orderId: "",
    priority: "medium",
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedLocation] = useState("Yaba")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/api/support/faqs?category=${selectedCategory}`)
        const data = await response.json()

        if (data.success) {
          setFaqData(data.data)
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error)
        toast({
          title: "Error",
          description: "Failed to load FAQs. Please try again.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [selectedCategory])

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        type: "error",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Support Ticket Created",
          description: `Your ticket ${data.data.ticketId} has been created. Expected response: ${data.data.estimatedResponse}`,
          type: "success",
        })
        setFormData({
          type: "",
          subject: "",
          message: "",
          orderId: "",
          priority: "medium",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error creating support ticket:", error)
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFAQs =
    faqData?.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar selectedLocation={selectedLocation} cartItemCount={0} onSearch={() => {}} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help you?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get quick answers to common questions or reach out to our support team for personalized assistance.
          </p>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-4">Message us on WhatsApp for quick support</p>
              <Button variant="outline" className="w-full bg-transparent">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us an email for detailed inquiries</p>
              <Button variant="outline" className="w-full bg-transparent">
                support@quickmarket.ng
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          {/* FAQ Section */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            {faqData && (
              <div className="flex flex-wrap justify-center gap-2">
                {faqData.categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            )}

            {/* FAQ List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms or browse different categories."
                      : "No FAQs available for the selected category."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact Form Section */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Support Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Support Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div>
                      <Label htmlFor="type">Issue Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order Issue</SelectItem>
                          <SelectItem value="delivery">Delivery Problem</SelectItem>
                          <SelectItem value="subscription">Subscription Help</SelectItem>
                          <SelectItem value="payment">Payment Issue</SelectItem>
                          <SelectItem value="technical">Technical Problem</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.type === "order" && (
                      <div>
                        <Label htmlFor="orderId">Order ID (Optional)</Label>
                        <Input
                          id="orderId"
                          value={formData.orderId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, orderId: e.target.value }))}
                          placeholder="e.g., QM-2024-001"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                        placeholder="Please provide detailed information about your issue..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Ticket...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Create Support Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Support Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Response Times</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Live Chat</span>
                      <span className="text-sm font-medium text-green-600">Immediate</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">WhatsApp</span>
                      <span className="text-sm font-medium text-blue-600">Within 30 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email/Tickets</span>
                      <span className="text-sm font-medium text-orange-600">2-4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Urgent Issues</span>
                      <span className="text-sm font-medium text-red-600">Within 1 hour</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-medium">8:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Emergency support is available 24/7 for urgent order and delivery issues.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Other Ways to Reach Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">+234 800 QUICK MARKET</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">support@quickmarket.ng</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">@QuickMarketNG (Twitter)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
