"use server"

import prisma from "@/lib/prisma"
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Baby,
  Syringe,
  Activity,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"

async function getAnalyticsData() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  // Get current period stats
  const [
    totalHospitals,
    activeHospitals,
    totalMothers,
    mothersThisMonth,
    mothersPrevMonth,
    totalChildren,
    childrenThisMonth,
    childrenPrevMonth,
    totalImmunizations,
    immunizationsThisMonth,
    immunizationsPrevMonth,
    hospitalStats,
    monthlyGrowth,
    vaccineStats,
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: "ACTIVE" } }),
    prisma.mother.count(),
    prisma.mother.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.mother.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.child.count(),
    prisma.child.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.child.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.immunizationRecord.count(),
    prisma.immunizationRecord.count({
      where: { administeredAt: { gte: thirtyDaysAgo } },
    }),
    prisma.immunizationRecord.count({
      where: {
        administeredAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    // Hospital performance stats
    prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            mothers: true,
            healthWorkers: true,
          },
        },
      },
      orderBy: {
        mothers: { _count: "desc" },
      },
      take: 10,
    }),
    // Monthly growth - last 6 months
    Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const date = subMonths(now, 5 - i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        const [mothers, children, immunizations] = await Promise.all([
          prisma.mother.count({
            where: { createdAt: { gte: start, lte: end } },
          }),
          prisma.child.count({
            where: { createdAt: { gte: start, lte: end } },
          }),
          prisma.immunizationRecord.count({
            where: { administeredAt: { gte: start, lte: end } },
          }),
        ])

        return {
          month: format(date, "MMM yyyy"),
          mothers,
          children,
          immunizations,
        }
      })
    ),
    // Vaccine type stats
    prisma.hospitalVaccine.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            immunizationRecords: true,
          },
        },
      },
      orderBy: {
        immunizationRecords: { _count: "desc" },
      },
      take: 10,
    }),
  ])

  // Calculate percentage changes
  const motherGrowth =
    mothersPrevMonth > 0
      ? ((mothersThisMonth - mothersPrevMonth) / mothersPrevMonth) * 100
      : 100
  const childGrowth =
    childrenPrevMonth > 0
      ? ((childrenThisMonth - childrenPrevMonth) / childrenPrevMonth) * 100
      : 100
  const immunizationGrowth =
    immunizationsPrevMonth > 0
      ? ((immunizationsThisMonth - immunizationsPrevMonth) /
          immunizationsPrevMonth) *
        100
      : 100

  return {
    overview: {
      totalHospitals,
      activeHospitals,
      totalMothers,
      mothersThisMonth,
      motherGrowth,
      totalChildren,
      childrenThisMonth,
      childGrowth,
      totalImmunizations,
      immunizationsThisMonth,
      immunizationGrowth,
    },
    hospitalStats,
    monthlyGrowth,
    vaccineStats,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  // Calculate max for bar chart scaling
  const maxMonthlyValue = Math.max(
    ...data.monthlyGrowth.flatMap((m) => [m.mothers, m.children, m.immunizations])
  )

  const totalVaccineCount = data.vaccineStats.reduce(
    (sum, v) => sum + v._count.immunizationRecords,
    0
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Platform performance metrics and growth trends
        </p>
      </div>

      {/* Overview Stats with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hospitals */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Hospitals
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.overview.totalHospitals}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Active: {data.overview.activeHospitals}
            </span>
            <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 text-xs font-medium">
              {Math.round(
                (data.overview.activeHospitals / data.overview.totalHospitals) *
                  100
              )}
              % active
            </span>
          </div>
        </div>

        {/* Mothers */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Mothers
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.overview.totalMothers.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              This month: +{data.overview.mothersThisMonth}
            </span>
            <span
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-medium ${
                data.overview.motherGrowth >= 0
                  ? "bg-green-100 dark:bg-green-500/20 text-green-600"
                  : "bg-red-100 dark:bg-red-500/20 text-red-600"
              }`}
            >
              {data.overview.motherGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(data.overview.motherGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Children */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Baby className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Children
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.overview.totalChildren.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              This month: +{data.overview.childrenThisMonth}
            </span>
            <span
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-medium ${
                data.overview.childGrowth >= 0
                  ? "bg-green-100 dark:bg-green-500/20 text-green-600"
                  : "bg-red-100 dark:bg-red-500/20 text-red-600"
              }`}
            >
              {data.overview.childGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(data.overview.childGrowth).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Immunizations */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Syringe className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Immunizations
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.overview.totalImmunizations.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              This month: +{data.overview.immunizationsThisMonth}
            </span>
            <span
              className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-medium ${
                data.overview.immunizationGrowth >= 0
                  ? "bg-green-100 dark:bg-green-500/20 text-green-600"
                  : "bg-red-100 dark:bg-red-500/20 text-red-600"
              }`}
            >
              {data.overview.immunizationGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(data.overview.immunizationGrowth).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                Monthly Growth
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last 6 months registration trends
              </p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-pink-500"></span>
                Mothers
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cyan-500"></span>
                Children
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                Immunizations
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {data.monthlyGrowth.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {month.month}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {month.mothers + month.children + month.immunizations} total
                  </span>
                </div>
                <div className="flex gap-1 h-6">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-pink-600 rounded-l-full transition-all"
                    style={{
                      width: `${(month.mothers / (maxMonthlyValue || 1)) * 100}%`,
                    }}
                    title={`Mothers: ${month.mothers}`}
                  ></div>
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                    style={{
                      width: `${(month.children / (maxMonthlyValue || 1)) * 100}%`,
                    }}
                    title={`Children: ${month.children}`}
                  ></div>
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-r-full transition-all"
                    style={{
                      width: `${
                        (month.immunizations / (maxMonthlyValue || 1)) * 100
                      }%`,
                    }}
                    title={`Immunizations: ${month.immunizations}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vaccine Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-violet-500" />
              Vaccine Distribution
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Most administered vaccines
            </p>
          </div>
          <div className="space-y-3">
            {data.vaccineStats.length === 0 ? (
              <div className="text-center py-8">
                <Syringe className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  No immunization data yet
                </p>
              </div>
            ) : (
              data.vaccineStats.map((vaccine, index) => {
                const percentage =
                  totalVaccineCount > 0
                    ? (vaccine._count.immunizationRecords / totalVaccineCount) * 100
                    : 0
                const colors = [
                  "from-violet-400 to-violet-600",
                  "from-pink-400 to-pink-600",
                  "from-cyan-400 to-cyan-600",
                  "from-emerald-400 to-emerald-600",
                  "from-amber-400 to-amber-600",
                  "from-rose-400 to-rose-600",
                  "from-blue-400 to-blue-600",
                  "from-indigo-400 to-indigo-600",
                  "from-teal-400 to-teal-600",
                  "from-orange-400 to-orange-600",
                ]
                return (
                  <div key={vaccine.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {vaccine.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {vaccine._count.immunizationRecords} ({percentage.toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Hospitals */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-500" />
            Top Performing Hospitals
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hospitals with the highest registrations
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Hospital
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Subdomain
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Mothers
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Health Workers
                </th>
              </tr>
            </thead>
            <tbody>
              {data.hospitalStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-slate-500 dark:text-slate-400"
                  >
                    No hospital data available
                  </td>
                </tr>
              ) : (
                data.hospitalStats.map((hospital, index) => (
                  <tr
                    key={hospital.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm ${
                          index === 0
                            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                            : index === 1
                              ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                              : index === 2
                                ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {hospital.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-violet-600 dark:text-violet-400">
                        {hospital.slug}.marv.ug
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {hospital._count.mothers}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {hospital._count.healthWorkers}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
