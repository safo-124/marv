import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  Users, 
  Baby, 
  Syringe, 
  UserCog, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from "lucide-react"
import { format, subDays } from "date-fns"

async function getHospitalData(hospitalId: string) {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  const [
    totalMothers,
    mothersThisMonth,
    totalChildren,
    childrenThisMonth,
    totalWorkers,
    totalVaccines,
    completedImmunizations,
    scheduledImmunizations,
    overdueImmunizations,
    pendingAlerts,
    recentMothers,
    upcomingSchedules,
  ] = await Promise.all([
    prisma.mother.count({ where: { currentHospitalId: hospitalId } }),
    prisma.mother.count({ 
      where: { 
        currentHospitalId: hospitalId,
        createdAt: { gte: thirtyDaysAgo }
      } 
    }),
    prisma.child.count({ where: { currentHospitalId: hospitalId } }),
    prisma.child.count({ 
      where: { 
        currentHospitalId: hospitalId,
        createdAt: { gte: thirtyDaysAgo }
      } 
    }),
    prisma.healthWorker.count({ where: { hospitalId } }),
    prisma.hospitalVaccine.count({ where: { hospitalId, isActive: true } }),
    prisma.immunizationSchedule.count({ 
      where: { 
        child: { currentHospitalId: hospitalId },
        status: "COMPLETED" 
      } 
    }),
    prisma.immunizationSchedule.count({ 
      where: { 
        child: { currentHospitalId: hospitalId },
        status: "SCHEDULED" 
      } 
    }),
    prisma.immunizationSchedule.count({ 
      where: { 
        child: { currentHospitalId: hospitalId },
        status: "OVERDUE" 
      } 
    }),
    prisma.performanceAlert.count({ 
      where: { 
        hospitalId,
        status: "PENDING" 
      } 
    }),
    prisma.mother.findMany({
      where: { currentHospitalId: hospitalId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { children: true } },
      },
    }),
    prisma.immunizationSchedule.findMany({
      where: {
        child: { currentHospitalId: hospitalId },
        status: "SCHEDULED",
        scheduledDate: { gte: now },
      },
      orderBy: { scheduledDate: "asc" },
      take: 5,
      include: {
        child: true,
        vaccine: true,
      },
    }),
  ])

  return {
    stats: {
      totalMothers,
      mothersThisMonth,
      totalChildren,
      childrenThisMonth,
      totalWorkers,
      totalVaccines,
      completedImmunizations,
      scheduledImmunizations,
      overdueImmunizations,
      pendingAlerts,
    },
    recentMothers,
    upcomingSchedules,
  }
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  href,
}: { 
  title: string
  value: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  href?: string
}) {
  const content = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {href && (
          <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value.toLocaleString()}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

export default async function HospitalAdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
    where: { userId: session.user.id },
    include: { hospital: true },
  })

  if (!hospitalAdmin) redirect("/")

  const data = await getHospitalData(hospitalAdmin.hospital.id)

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏥</span>
            <span className="text-sm font-medium text-white/90">{hospitalAdmin.hospital.name}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h2>
          <p className="text-white/80 max-w-xl">
            Manage your hospital&apos;s immunization program. Track mothers, children, and ensure timely vaccinations.
          </p>
        </div>
      </div>

      {/* Performance Alerts Banner */}
      {data.stats.pendingAlerts > 0 && (
        <Link href="/hospital-admin/alerts">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  {data.stats.pendingAlerts} Pending Performance Alert{data.stats.pendingAlerts !== 1 ? "s" : ""}
                </h3>
                <p className="text-white/80">
                  Your hospital has alerts that require attention. Click to review and resolve.
                </p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
          </div>
        </Link>
      )}

      {/* Overdue Immunizations Alert */}
      {data.stats.overdueImmunizations > 0 && (
        <Link href="/hospital-admin/immunizations?status=overdue">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-6 shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  {data.stats.overdueImmunizations} Overdue Immunization{data.stats.overdueImmunizations !== 1 ? "s" : ""}
                </h3>
                <p className="text-white/80">
                  Some scheduled vaccinations are past their due date. Take action now.
                </p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Registered Mothers"
          value={data.stats.totalMothers}
          subtitle={`+${data.stats.mothersThisMonth} this month`}
          icon={Users}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          href="/hospital-admin/mothers"
        />
        <StatCard
          title="Registered Children"
          value={data.stats.totalChildren}
          subtitle={`+${data.stats.childrenThisMonth} this month`}
          icon={Baby}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
          href="/hospital-admin/children"
        />
        <StatCard
          title="Health Workers"
          value={data.stats.totalWorkers}
          subtitle="Active staff"
          icon={UserCog}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          href="/hospital-admin/workers"
        />
        <StatCard
          title="Active Vaccines"
          value={data.stats.totalVaccines}
          subtitle="In catalog"
          icon={Syringe}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          href="/hospital-admin/vaccines"
        />
      </div>

      {/* Immunization Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.completedImmunizations}</p>
              <p className="text-xs text-emerald-600">Vaccinations given</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Scheduled</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.scheduledImmunizations}</p>
              <p className="text-xs text-blue-600">Upcoming vaccinations</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl ${data.stats.overdueImmunizations > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 animate-pulse' : 'bg-gradient-to-br from-slate-400 to-slate-500'} flex items-center justify-center shadow-lg`}>
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</p>
              <p className={`text-3xl font-bold ${data.stats.overdueImmunizations > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                {data.stats.overdueImmunizations}
              </p>
              <p className={`text-xs ${data.stats.overdueImmunizations > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {data.stats.overdueImmunizations > 0 ? 'Require attention' : 'All on track'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Mothers */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Registrations</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Newly registered mothers</p>
              </div>
              <Link 
                href="/hospital-admin/mothers"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {data.recentMothers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No mothers registered yet</p>
                <Link href="/hospital-admin/mothers/register" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
                  Register first mother →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentMothers.map((mother) => (
                  <div 
                    key={mother.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{mother.firstName} {mother.lastName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{mother.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{mother._count.children} child{mother._count.children !== 1 ? 'ren' : ''}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(mother.createdAt), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Immunizations */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Immunizations</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Next scheduled vaccinations</p>
              </div>
              <Link 
                href="/hospital-admin/immunizations"
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {data.upcomingSchedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No upcoming immunizations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Syringe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{schedule.child.firstName} {schedule.child.lastName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{schedule.vaccine.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600">{format(new Date(schedule.scheduledDate), "MMM d")}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dose {schedule.doseNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/hospital-admin/mothers/register" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Register Mother</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">New registration</p>
            </div>
          </div>
        </Link>
        
        <Link href="/hospital-admin/immunizations/record" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Record Immunization</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Log vaccination</p>
            </div>
          </div>
        </Link>
        
        <Link href="/hospital-admin/vaccines" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Manage Vaccines</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Catalog & versions</p>
            </div>
          </div>
        </Link>
        
        <Link href="/hospital-admin/alerts" className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${data.stats.pendingAlerts > 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Performance Alerts</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {data.stats.pendingAlerts > 0 ? `${data.stats.pendingAlerts} pending` : 'All clear'}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
