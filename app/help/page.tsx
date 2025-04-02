"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Label } from "@/components/ui/label"

interface FAQ {
  question: string;
  answer: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  date: string;
}

export default function HelpPage() {
  const { darkMode } = useTheme()
  const { toast } = useToast()
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: ""
  })

  const faqs: FAQ[] = [
    {
      question: "How do I play the color prediction game?",
      answer: "Choose a color (Green, Violet, or Red) or a number (0-9) and place your bet. If your prediction matches the result, you win! Different combinations have different multipliers."
    },
    {
      question: "How do I add money to my wallet?",
      answer: "Go to the Wallet section, click on 'Add Money', enter the amount you want to add, and use the UPI payment option to complete the transaction."
    },
    {
      question: "What are the minimum and maximum bet amounts?",
      answer: "The minimum bet amount is ₹10 and the maximum bet amount is ₹10,000 per game."
    },
    {
      question: "How do I withdraw my winnings?",
      answer: "Go to the Wallet section and click on 'Withdraw'. Enter the amount you want to withdraw and your UPI ID. The amount will be transferred within 24 hours."
    },
    {
      question: "How does the referral system work?",
      answer: "Share your unique referral code with friends. When they sign up and make their first deposit, you get ₹100 and they get ₹50 bonus."
    }
  ]

  const handleNewTicket = () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const ticket: Ticket = {
      id: Math.random().toString(36).substring(2),
      subject: newTicket.subject,
      message: newTicket.message,
      status: "Open",
      date: new Date().toISOString()
    }

    setTickets([ticket, ...tickets])
    localStorage.setItem("supportTickets", JSON.stringify([ticket, ...tickets]))

    toast({
      title: "Success",
      description: "Support ticket created successfully",
    })

    setShowNewTicket(false)
    setNewTicket({ subject: "", message: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "text-blue-500"
      case "In Progress":
        return "text-yellow-500"
      case "Resolved":
        return "text-green-500"
      default:
        return darkMode ? "text-gray-400" : "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="w-5 h-5" />
      case "In Progress":
        return <Clock className="w-5 h-5" />
      case "Resolved":
        return <CheckCircle2 className="w-5 h-5" />
      default:
        return <HelpCircle className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "rgb(82,37,70)" }}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Contact Options */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
            >
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-6 h-6" />
                <span>support@example.com</span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
            >
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-6 h-6" />
                <span>+91 1234567890</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-red-700/30 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-4 py-3 flex items-center justify-between text-left bg-red-900/30 hover:bg-red-800/30"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/70 transform transition-transform ${
                      expandedFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 py-3 bg-red-900/30">
                    <p className="text-white/70">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Support Tickets</CardTitle>
            <Button
              onClick={() => setShowNewTicket(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Create New Ticket
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70">No support tickets yet</p>
                <p className="text-sm text-white/50">Create a ticket to get help</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg bg-red-900/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{ticket.subject}</h3>
                      <span className={`text-sm ${
                        ticket.status === "Open" ? "text-green-400" : "text-white/70"
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{ticket.message}</p>
                    <p className="text-xs text-white/50 mt-2">
                      Created on {new Date(ticket.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-gradient-to-b from-red-900/50 to-red-950/50 backdrop-blur-sm border border-red-700/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white/70">Subject</Label>
              <Input
                placeholder="Enter ticket subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                className="bg-red-900/30 border-red-700/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Message</Label>
              <textarea
                placeholder="Describe your issue"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="w-full h-32 p-2 rounded-md bg-red-900/30 border border-red-700/30 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTicket(false)}
              className="bg-red-900/30 border-red-700/30 text-white hover:bg-red-800/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNewTicket}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 