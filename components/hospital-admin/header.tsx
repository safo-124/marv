"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, LogOut, Settings, User, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface HospitalAdminHeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
  hospital: {
    name: string
    slug: string
  }
  pendingAlertsCount?: number
}

export function HospitalAdminHeader({ user, hospital, pendingAlertsCount = 0 }: HospitalAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Hospital Admin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hospital.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Alerts Notification */}
          <Link href="/hospital-admin/alerts">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`relative ${pendingAlertsCount > 0 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <AlertTriangle className="h-5 w-5" />
              {pendingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                  {pendingAlertsCount > 9 ? "9+" : pendingAlertsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hospital Admin</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <DropdownMenuLabel className="text-slate-900 dark:text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700">
                <Link href="/hospital-admin/settings">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700">
                <Link href="/hospital-admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
