import prisma from "@/lib/prisma"
import { Settings, Bell, Shield, Database, Users, Building2, Baby, Syringe, MessageSquare } from "lucide-react"
import { SystemSettingsForm } from "@/components/super-admin/system-settings-form"

async function getSystemSettings() {
  const settings = await prisma.systemAlertSettings.findFirst({
    orderBy: { createdAt: "desc" },
  })

  return settings
}

async function getSystemStats() {
  const [
    totalUsers,
    totalHospitals,
    totalMothers,
    totalChildren,
    totalImmunizations,
    totalNotifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.hospital.count(),
    prisma.mother.count(),
    prisma.child.count(),
    prisma.immunizationRecord.count(),
    prisma.notification.count(),
  ])

  return {
    totalUsers,
    totalHospitals,
    totalMothers,
    totalChildren,
    totalImmunizations,
    totalNotifications,
  }
}

export default async function SettingsPage() {
  const settings = await getSystemSettings()
  const stats = await getSystemStats()

  const statsConfig = [
    { label: "Users", value: stats.totalUsers, icon: Users, gradient: "from-blue-500 to-cyan-600" },
    { label: "Hospitals", value: stats.totalHospitals, icon: Building2, gradient: "from-violet-500 to-purple-600" },
    { label: "Mothers", value: stats.totalMothers, icon: Users, gradient: "from-pink-500 to-rose-600" },
    { label: "Children", value: stats.totalChildren, icon: Baby, gradient: "from-amber-500 to-orange-600" },
    { label: "Immunizations", value: stats.totalImmunizations, icon: Syringe, gradient: "from-emerald-500 to-green-600" },
    { label: "Notifications", value: stats.totalNotifications, icon: MessageSquare, gradient: "from-indigo-500 to-blue-600" },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
            <p className="text-slate-300">
              Manage global system configuration and monitoring
            </p>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statsConfig.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Alert Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Alert Settings</h3>
              <p className="text-sm text-white/80">
                Configure when performance alerts are triggered and escalated
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SystemSettingsForm 
            settings={settings ? {
              overdueThresholdDefault: settings.overdueThresholdDefault,
              escalationDelayDays: settings.escalationDelayDays,
              completionDropThreshold: settings.completionDropThreshold,
              inactivityDays: settings.inactivityDays,
              criticalThreshold: settings.criticalThreshold,
              emailAlertsEnabled: settings.emailAlertsEnabled,
              pushAlertsEnabled: settings.pushAlertsEnabled,
            } : undefined}
          />
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">System Information</h3>
              <p className="text-sm text-white/80">
                Technical details about the system
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Platform</p>
              <p className="font-semibold text-slate-900 dark:text-white">MARV - Mothers Immunization Tracking System</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Version</p>
              <p className="font-semibold text-slate-900 dark:text-white">1.0.0</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Database</p>
              <p className="font-semibold text-slate-900 dark:text-white">PostgreSQL (Prisma)</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Framework</p>
              <p className="font-semibold text-slate-900 dark:text-white">Next.js 16 + React 19</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
