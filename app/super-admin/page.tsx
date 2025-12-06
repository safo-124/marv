import prisma from "@/lib/prisma"
import { Building2, Users, Baby, Syringe, AlertTriangle, CheckCircle2, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Sparkles, BarChart3, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { subDays } from "date-fns"

async function getStats() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  const [
    hospitalCount,
    activeHospitalCount,
    motherCount,
    childCount,
    completedImmunizations,
    overdueSchedules,
    pendingAlerts,
    // Trend data - last 30 days
    mothersThisMonth,
    mothersPrevMonth,
    childrenThisMonth,
    childrenPrevMonth,
    immunizationsThisMonth,
    immunizationsPrevMonth,
    hospitalsThisMonth,
    hospitalsPrevMonth,
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: "ACTIVE" } }),
    prisma.mother.count(),
    prisma.child.count(),
    prisma.immunizationSchedule.count({ where: { status: "COMPLETED" } }),
    prisma.immunizationSchedule.count({ where: { status: "OVERDUE" } }),
    prisma.performanceAlert.count({ where: { status: "PENDING" } }),
    // Trend calculations
    prisma.mother.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.mother.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.child.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.child.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.immunizationSchedule.count({ where: { status: "COMPLETED", updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.immunizationSchedule.count({ where: { status: "COMPLETED", updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.hospital.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.hospital.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
  ])

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  return {
    hospitalCount,
    activeHospitalCount,
    motherCount,
    childCount,
    completedImmunizations,
    overdueSchedules,
    pendingAlerts,
    trends: {
      hospitals: calculateTrend(hospitalsThisMonth, hospitalsPrevMonth),
      mothers: calculateTrend(mothersThisMonth, mothersPrevMonth),
      children: calculateTrend(childrenThisMonth, childrenPrevMonth),
      immunizations: calculateTrend(immunizationsThisMonth, immunizationsPrevMonth),
    },
    thisMonth: {
      mothers: mothersThisMonth,
      children: childrenThisMonth,
      immunizations: immunizationsThisMonth,
    },
  }
}

async function getRecentHospitals() {
  return prisma.hospital.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          mothers: true,
          children: true,
        },
      },
    },
  })
}

// Stat card component with solid colors
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  gradient 
}: { 
  title: string
  value: number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down"
  trendValue?: string
  gradient: string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trend === "up" 
              ? "bg-green-100 dark:bg-green-500/20 text-green-600" 
              : "bg-red-100 dark:bg-red-500/20 text-red-600"
          }`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-4 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${gradient} rounded-full`} style={{ width: "75%" }} />
      </div>
    </div>
  )
}

// Alert card with special styling
function AlertCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isWarning,
  gradient,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  isWarning: boolean
  gradient: string
}) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 transition-all duration-300 shadow-lg ${
      isWarning ? "border-red-400 dark:border-red-500" : "border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`h-14 w-14 rounded-xl ${gradient} flex items-center justify-center shadow-lg ${isWarning ? "animate-pulse" : ""}`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
          <p className={`text-3xl font-bold ${isWarning ? "text-red-600" : "text-slate-900 dark:text-white"}`}>{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {isWarning && value > 0 && (
          <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
        )}
      </div>
    </div>
  )
}

export default async function SuperAdminDashboard() {
  const stats = await getStats()
  const recentHospitals = await getRecentHospitals()

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🇺🇬</span>
            <span className="text-sm font-medium text-white/90">MARV Uganda</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
            Dashboard Overview
          </h2>
          <p className="text-white/80 max-w-xl">
            Monitor immunization coverage across Uganda. Track mothers, children, and healthcare facilities nationwide.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hospitals"
          value={stats.hospitalCount}
          subtitle={`${stats.activeHospitalCount} active`}
          icon={Building2}
          trend={stats.trends.hospitals >= 0 ? "up" : "down"}
          trendValue={`${stats.trends.hospitals >= 0 ? "+" : ""}${stats.trends.hospitals.toFixed(0)}%`}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <StatCard
          title="Registered Mothers"
          value={stats.motherCount}
          subtitle={`+${stats.thisMonth.mothers} this month`}
          icon={Users}
          trend={stats.trends.mothers >= 0 ? "up" : "down"}
          trendValue={`${stats.trends.mothers >= 0 ? "+" : ""}${stats.trends.mothers.toFixed(0)}%`}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        />
        <StatCard
          title="Registered Children"
          value={stats.childCount}
          subtitle={`+${stats.thisMonth.children} this month`}
          icon={Baby}
          trend={stats.trends.children >= 0 ? "up" : "down"}
          trendValue={`${stats.trends.children >= 0 ? "+" : ""}${stats.trends.children.toFixed(0)}%`}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
        />
        <StatCard
          title="Completed Immunizations"
          value={stats.completedImmunizations}
          subtitle={`+${stats.thisMonth.immunizations} this month`}
          icon={Syringe}
          trend={stats.trends.immunizations >= 0 ? "up" : "down"}
          trendValue={`${stats.trends.immunizations >= 0 ? "+" : ""}${stats.trends.immunizations.toFixed(0)}%`}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
      </div>

      {/* Alerts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <AlertCard
          title="Pending Alerts"
          value={stats.pendingAlerts}
          subtitle="Performance alerts requiring attention"
          icon={AlertTriangle}
          isWarning={stats.pendingAlerts > 0}
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
        />
        <AlertCard
          title="Overdue Immunizations"
          value={stats.overdueSchedules}
          subtitle="Scheduled vaccinations past due date"
          icon={Activity}
          isWarning={stats.overdueSchedules > 0}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Recent Hospitals */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Hospitals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Recently registered hospitals in the system
              </p>
            </div>
            <Link 
              href="/super-admin/hospitals"
              className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentHospitals.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No hospitals registered yet</p>
              <Link 
                href="/super-admin/hospitals"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
              >
                Add your first hospital
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentHospitals.map((hospital, index) => (
                <div
                  key={hospital.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 group border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{hospital.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {hospital.slug}.marv.ug
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{hospital._count.mothers}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mothers</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{hospital._count.children}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Children</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      hospital.status === "ACTIVE"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600"
                        : hospital.status === "PENDING"
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600"
                        : "bg-red-100 dark:bg-red-500/20 text-red-600"
                    }`}>
                      {hospital.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/super-admin/hospitals" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Manage Hospitals</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, or remove</p>
            </div>
          </div>
        </Link>
        
        <Link href="/super-admin/analytics" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">View Analytics</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Charts & insights</p>
            </div>
          </div>
        </Link>
        
        <Link href="/super-admin/vaccines" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">All Vaccines</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monitor inventory</p>
            </div>
          </div>
        </Link>
        
        <Link href="/super-admin/alerts" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Check Alerts</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Performance issues</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
