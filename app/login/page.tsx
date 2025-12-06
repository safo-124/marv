"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const error = searchParams.get("error")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError("Invalid email or password")
        setIsLoading(false)
      } else {
        // Redirect to dashboard which will route based on role
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch {
      setLoginError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇺🇬</span>
              <h1 className="text-2xl font-bold text-white">MARV Uganda</h1>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            Mothers&apos; Immunization Tracking System
          </p>
          <p className="text-white/60 text-xs mt-1">
            Ministry of Health - Uganda
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || loginError) && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-3 rounded-lg text-sm text-center">
                {loginError || "Authentication failed. Please try again."}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@marv.ug"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 h-11"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-500/25 border-0 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
            <p className="text-slate-500 text-xs">
              Secure access to the national immunization registry
            </p>
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-slate-800/40 backdrop-blur border border-slate-700/30 rounded-xl">
        <p className="text-slate-400 text-xs text-center mb-3 font-medium uppercase tracking-wide">Demo Credentials</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
            <p className="text-violet-400 font-medium mb-1">Super Admin</p>
            <p className="text-slate-400">admin@marv.com</p>
            <p className="text-slate-500">admin123</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
            <p className="text-emerald-400 font-medium mb-1">Hospital Admin</p>
            <p className="text-slate-400">hospitaladmin@marv.com</p>
            <p className="text-slate-500">hospital123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">MARV Uganda</h1>
          <p className="text-white/80 text-sm mt-1">
            Mothers&apos; Immunization Tracking System
          </p>
        </div>
        <div className="p-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      </div>
      
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
