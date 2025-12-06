"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Building2,
  Syringe,
  Users,
  Bell,
  Settings,
  FileDown,
  Shield,
  Sparkles,
  BarChart3,
  ScrollText,
  FileText,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/super-admin",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Hospitals",
    href: "/super-admin/hospitals",
    icon: Building2,
  },
  {
    title: "All Vaccines",
    href: "/super-admin/vaccines",
    icon: Syringe,
  },
  {
    title: "All Mothers",
    href: "/super-admin/mothers",
    icon: Users,
  },
  {
    title: "Performance Alerts",
    href: "/super-admin/alerts",
    icon: Bell,
  },
  {
    title: "Activity Logs",
    href: "/super-admin/activity",
    icon: ScrollText,
  },
  {
    title: "Reports",
    href: "/super-admin/reports",
    icon: FileText,
  },
  {
    title: "Data Exports",
    href: "/super-admin/exports",
    icon: FileDown,
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
]

interface SuperAdminSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function SuperAdminSidebar({ user }: SuperAdminSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0">
      <div className="h-full bg-slate-800 dark:bg-slate-900 rounded-r-2xl shadow-xl">
        <SidebarHeader className="border-b border-slate-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 text-sm">🇺🇬</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">MARV Uganda</h2>
              <p className="text-xs text-slate-400 font-medium">Super Admin</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`
                          rounded-xl transition-all duration-300 h-11
                          ${isActive 
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" 
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                          }
                        `}
                      >
                        <Link href={item.href} className="flex items-center gap-3 px-3">
                          <item.icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
                          <span className="font-medium">{item.title}</span>
                          {isActive && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-700 p-4">
          <div className="bg-slate-700 rounded-xl p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
