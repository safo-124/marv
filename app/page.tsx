import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Building2, Baby, Syringe } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            MARV
          </h1>
          <p className="text-xl text-blue-600 font-semibold mt-2">
            Mothers Immunization Tracking System
          </p>
          <p className="mt-6 text-lg text-gray-600">
            A comprehensive multi-tenant SaaS platform for managing childhood immunization programs
            across hospitals. Track vaccinations, schedule appointments, and ensure no child misses
            their immunizations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Multi-Hospital</CardTitle>
              <CardDescription>
                Each hospital has its own subdomain with complete data isolation and customization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Baby className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Child Tracking</CardTitle>
              <CardDescription>
                Register mothers during delivery and automatically track all their children&apos;s immunizations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Syringe className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Auto-Scheduling</CardTitle>
              <CardDescription>
                Automatically generate immunization schedules based on birth date and hospital vaccine programs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Notifications</CardTitle>
              <CardDescription>
                Configurable notification frequencies: single, daily, or escalating reminders for overdue vaccines
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} MARV. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
