"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full text-center p-8 !bg-white/10">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
            <ShieldX className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-white/60 mb-6">
          You don't have permission to access this page. Please sign in with an account that has the appropriate permissions.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </Link>
        </div>

        <p className="text-white/40 text-sm mt-6">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
