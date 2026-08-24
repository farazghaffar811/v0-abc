"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            About Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Coinbase</h3>
            <p className="text-gray-600 leading-relaxed">
              Coinbase is a leading cryptocurrency trading platform that
              provides secure, reliable, and user-friendly services for digital
              asset trading. We are committed to delivering the best trading
              experience with advanced technology and comprehensive security
              measures.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
