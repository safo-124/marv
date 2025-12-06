import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Clock, ArrowUpRight, Bell, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

async function getAlertStats() {
  const [totalAlerts, pendingAlerts, resolvedAlerts, escalatedAlerts] = await Promise.all([
    prisma.performanceAlert.count(),
    prisma.performanceAlert.count({ where: { status: "PENDING" } }),
    prisma.performanceAlert.count({ where: { status: "RESOLVED" } }),
    prisma.performanceAlert.count({ where: { escalationLevel: { gt: 1 } } }),
  ])

  return { totalAlerts, pendingAlerts, resolvedAlerts, escalatedAlerts }
}

async function getAlerts() {
  return prisma.performanceAlert.findMany({
    take: 100,
    orderBy: [
      { status: "asc" }, // Pending first
      { createdAt: "desc" },
    ],
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })
}

export default async function AlertsPage() {
  const stats = await getAlertStats()
  const alerts = await getAlerts()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 text-sm font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "ACKNOWLEDGED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-600 text-sm font-medium">
            Acknowledged
          </span>
        )
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-600 text-sm font-medium">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "LOW":
        return <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-600 text-sm font-medium">Low</span>
      case "MEDIUM":
        return <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 text-sm font-medium">Medium</span>
      case "HIGH":
        return <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-600 text-sm font-medium">High</span>
      case "CRITICAL":
        return <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-600 text-sm font-medium animate-pulse">Critical</span>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Performance Alerts</h2>
            <p className="text-white/80">
              Monitor and manage system-wide alerts
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Alerts</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalAlerts}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">all time</p>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border ${stats.pendingAlerts > 0 ? "border-2 border-amber-400 dark:border-amber-500" : "border-slate-200 dark:border-slate-700"}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${stats.pendingAlerts > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse" : "bg-gradient-to-br from-amber-500 to-orange-600"}`}>
              <Clock className="h-6 w-6 text-white" />
            </div>
            {stats.pendingAlerts > 0 && (
              <div className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</h3>
            <p className={`text-3xl font-bold ${stats.pendingAlerts > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>{stats.pendingAlerts}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">need attention</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolvedAlerts}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">completed</p>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border ${stats.escalatedAlerts > 0 ? "border-2 border-red-400 dark:border-red-500" : "border-slate-200 dark:border-slate-700"}`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${stats.escalatedAlerts > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 animate-pulse" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            {stats.escalatedAlerts > 0 && (
              <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Escalated</h3>
            <p className={`text-3xl font-bold ${stats.escalatedAlerts > 0 ? "text-red-600" : "text-slate-900 dark:text-white"}`}>{stats.escalatedAlerts}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">to super admin</p>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Alerts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Performance alerts from all hospitals
          </p>
        </div>
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600 mb-1">All Clear!</p>
              <p className="text-slate-500 dark:text-slate-400">
                No alerts to display. Everything is running smoothly!
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Alert</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Hospital</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Severity</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Created</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Escalated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700">
                      <TableCell>
                        <p className="font-medium max-w-xs truncate text-slate-900 dark:text-white">
                          {alert.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {alert.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        {alert.hospital ? (
                          <Link 
                            href={`/super-admin/hospitals/${alert.hospital.id}`}
                            className="text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1"
                          >
                            {alert.hospital.name}
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium">
                          {alert.type.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {format(new Date(alert.triggeredAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(alert.triggeredAt), "h:mm a")}
                        </p>
                      </TableCell>
                      <TableCell>
                        {alert.escalationLevel > 1 ? (
                          <span className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 text-sm font-semibold">
                            Level {alert.escalationLevel}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
