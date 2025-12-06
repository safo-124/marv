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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, LogOut, User, Moon, Sun, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SuperAdminHeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function SuperAdminHeader({ user }: SuperAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 mx-4 mt-4">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl px-6 h-16 flex items-center justify-between border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-700 dark:text-slate-300" />
          <div className="hidden md:flex items-center gap-2">
            <h1 className="text-xl font-bold text-violet-600 dark:text-violet-400">Super Admin</h1>
            <span className="text-slate-500 dark:text-slate-400">Dashboard</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search hospitals, mothers, vaccines..." 
              className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500/50 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl h-10 w-10 transition-all duration-300 text-slate-700 dark:text-slate-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
              3
            </span>
          </Button>

          {/* Theme Toggle Placeholder */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl h-10 w-10 transition-all duration-300 text-slate-700 dark:text-slate-300"
          >
            <Sun className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 rounded-xl px-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-all duration-300"
              >
                <Avatar className="h-8 w-8 ring-2 ring-violet-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl" align="end">
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-lg font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-medium w-fit mt-1">
                      Super Admin
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                <User className="mr-3 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                className="rounded-lg cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
