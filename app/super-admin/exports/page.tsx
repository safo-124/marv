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
import { Download, FileText, Clock, CheckCircle, XCircle, FileDown, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ExportDataButton } from "@/components/super-admin/export-data-button"

async function getExportStats() {
  const [totalExports, completedExports, pendingExports] = await Promise.all([
    prisma.dataExport.count(),
    prisma.dataExport.count({ where: { status: "COMPLETED" } }),
    prisma.dataExport.count({ where: { status: "PENDING" } }),
  ])

  return { totalExports, completedExports, pendingExports }
}

async function getExports() {
  return prisma.dataExport.findMany({
    take: 50,
    orderBy: { requestedAt: "desc" },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export default async function ExportsPage() {
  const stats = await getExportStats()
  const exports = await getExports()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 text-sm font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-600 text-sm font-medium animate-pulse">
            Processing
          </span>
        )
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-600 text-sm font-medium">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        )
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-600 text-sm font-medium">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MOTHERS":
        return "Mothers"
      case "CHILDREN":
        return "Children"
      case "IMMUNIZATIONS":
        return "Immunizations"
      case "FULL":
        return "Full Data"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <FileDown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Data Exports</h2>
            <p className="text-white/80">
              Generate and download data exports
            </p>
          </div>
        </div>
        <ExportDataButton />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Exports</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalExports}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">all time</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedExports}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ready to download</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            {stats.pendingExports > 0 && (
              <div className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</h3>
            <p className={`text-3xl font-bold ${stats.pendingExports > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>{stats.pendingExports}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">in progress</p>
          </div>
        </div>
      </div>

      {/* Exports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recent data exports and their status
          </p>
        </div>
        <div className="p-6">
          {exports.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-lg font-medium mb-1 text-slate-900 dark:text-white">No exports yet</p>
              <p className="text-slate-500 dark:text-slate-400">
                Click &quot;New Export&quot; to generate data.
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Hospital</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Requested By</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Created</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Records</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.map((exportItem) => (
                    <TableRow key={exportItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700">
                      <TableCell>
                        <span className="px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-medium text-sm">
                          {getTypeLabel(exportItem.exportType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {exportItem.hospital ? (
                          <Link 
                            href={`/super-admin/hospitals/${exportItem.hospital.id}`}
                            className="text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1"
                          >
                            {exportItem.hospital.name}
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">All Hospitals</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{exportItem.user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{exportItem.user.email}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(exportItem.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {format(new Date(exportItem.requestedAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(exportItem.requestedAt), "h:mm a")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-white">{exportItem.recordCount ?? "-"}</span>
                      </TableCell>
                      <TableCell>
                        {exportItem.status === "COMPLETED" && exportItem.fileUrl && (
                          <a 
                            href={exportItem.fileUrl} 
                            download
                            className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 hover:bg-violet-200 dark:hover:bg-violet-500/30 flex items-center justify-center transition-colors"
                          >
                            <Download className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          </a>
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
