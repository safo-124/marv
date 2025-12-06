"use server"

import prisma from "@/lib/prisma"
import {
  ScrollText,
  Building2,
  Users,
  Syringe,
  Shield,
  Settings,
  UserPlus,
  UserCog,
  Baby,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { format } from "date-fns"

interface SearchParams {
  page?: string
  type?: string
}

async function getActivityLogs(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1")
  const pageSize = 20
  const skip = (page - 1) * pageSize

  // For now, we'll create a composite activity log from various database operations
  // In a production app, you'd have a dedicated AuditLog table

  const [
    recentHospitals,
    recentMothers,
    recentChildren,
    recentImmunizations,
    recentHealthWorkers,
    recentUsers,
  ] = await Promise.all([
    prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.mother.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        currentHospital: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.child.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        currentHospital: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.immunizationRecord.findMany({
      select: {
        id: true,
        administeredAt: true,
        child: { select: { firstName: true, lastName: true } },
        vaccine: { select: { name: true } },
        hospital: { select: { name: true } },
      },
      orderBy: { administeredAt: "desc" },
      take: 50,
    }),
    prisma.healthWorker.findMany({
      select: {
        id: true,
        createdAt: true,
        user: { select: { name: true } },
        hospital: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  // Combine all activities into a unified log
  type ActivityItem = {
    id: string
    type: string
    action: string
    description: string
    timestamp: Date
    icon: string
    color: string
    hospital?: string
  }

  const activities: ActivityItem[] = []

  // Add hospital activities
  recentHospitals.forEach((h) => {
    activities.push({
      id: `hospital-${h.id}`,
      type: "hospital",
      action: "Hospital Created",
      description: `New hospital "${h.name}" was registered`,
      timestamp: h.createdAt,
      icon: "building",
      color: "violet",
    })
  })

  // Add mother registrations
  recentMothers.forEach((m) => {
    activities.push({
      id: `mother-${m.id}`,
      type: "mother",
      action: "Mother Registered",
      description: `${m.firstName} ${m.lastName} was registered`,
      timestamp: m.createdAt,
      icon: "users",
      color: "pink",
      hospital: m.currentHospital.name,
    })
  })

  // Add child registrations
  recentChildren.forEach((c) => {
    activities.push({
      id: `child-${c.id}`,
      type: "child",
      action: "Child Registered",
      description: `${c.firstName} ${c.lastName} was registered`,
      timestamp: c.createdAt,
      icon: "baby",
      color: "cyan",
      hospital: c.currentHospital.name,
    })
  })

  // Add immunizations
  recentImmunizations.forEach((i) => {
    activities.push({
      id: `immunization-${i.id}`,
      type: "immunization",
      action: "Immunization Recorded",
      description: `${i.vaccine.name} administered to ${i.child.firstName} ${i.child.lastName}`,
      timestamp: i.administeredAt,
      icon: "syringe",
      color: "emerald",
      hospital: i.hospital.name,
    })
  })

  // Add health worker activities
  recentHealthWorkers.forEach((hw) => {
    activities.push({
      id: `worker-${hw.id}`,
      type: "healthworker",
      action: "Health Worker Added",
      description: `${hw.user.name} was added as health worker`,
      timestamp: hw.createdAt,
      icon: "usercog",
      color: "amber",
      hospital: hw.hospital.name,
    })
  })

  // Add user activities
  recentUsers.forEach((u) => {
    activities.push({
      id: `user-${u.id}`,
      type: "user",
      action: `${u.role} Account Created`,
      description: `${u.name} (${u.email}) account was created`,
      timestamp: u.createdAt,
      icon: "userplus",
      color: "blue",
    })
  })

  // Sort by timestamp descending
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Filter by type if specified
  const filteredActivities = searchParams.type
    ? activities.filter((a) => a.type === searchParams.type)
    : activities

  // Paginate
  const totalItems = filteredActivities.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedActivities = filteredActivities.slice(skip, skip + pageSize)

  return {
    activities: paginatedActivities,
    totalItems,
    totalPages,
    currentPage: page,
  }
}

function getIconComponent(icon: string) {
  switch (icon) {
    case "building":
      return Building2
    case "users":
      return Users
    case "baby":
      return Baby
    case "syringe":
      return Syringe
    case "usercog":
      return UserCog
    case "userplus":
      return UserPlus
    default:
      return ScrollText
  }
}

function getColorClasses(color: string) {
  const colorMap: Record<string, string> = {
    violet: "from-violet-500 to-purple-600",
    pink: "from-pink-500 to-rose-600",
    cyan: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-green-600",
    amber: "from-amber-500 to-orange-600",
    blue: "from-blue-500 to-indigo-600",
  }
  return colorMap[color] || "from-slate-500 to-slate-600"
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const data = await getActivityLogs(params)

  const activityTypes = [
    { value: "", label: "All Activities" },
    { value: "hospital", label: "Hospitals" },
    { value: "mother", label: "Mothers" },
    { value: "child", label: "Children" },
    { value: "immunization", label: "Immunizations" },
    { value: "healthworker", label: "Health Workers" },
    { value: "user", label: "Users" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track all activities across the platform
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            defaultValue={params.type || ""}
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {activityTypes.slice(1).map((type) => (
          <div
            key={type.value}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {type.label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {data.activities.filter((a) => a.type === type.value).length}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-violet-500" />
            Recent Activities
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {data.activities.length} of {data.totalItems} activities
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {data.activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <ScrollText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                No activities found
              </p>
            </div>
          ) : (
            data.activities.map((activity) => {
              const IconComponent = getIconComponent(activity.icon)
              const colorClasses = getColorClasses(activity.color)

              return (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {activity.action}
                        </p>
                        <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                          {format(
                            new Date(activity.timestamp),
                            "MMM d, yyyy HH:mm"
                          )}
                        </time>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {activity.description}
                      </p>
                      {activity.hospital && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {activity.hospital}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {data.currentPage} of {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <a
                href={`?page=${data.currentPage - 1}${params.type ? `&type=${params.type}` : ""}`}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 ${
                  data.currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                aria-disabled={data.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </a>
              <a
                href={`?page=${data.currentPage + 1}${params.type ? `&type=${params.type}` : ""}`}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 ${
                  data.currentPage === data.totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
                aria-disabled={data.currentPage === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
