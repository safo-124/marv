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
import { Syringe, Building2, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

async function getVaccineStats() {
  const [totalVaccines, activeVaccines, hospitalCount] = await Promise.all([
    prisma.hospitalVaccine.count(),
    prisma.hospitalVaccine.count({ where: { isActive: true } }),
    prisma.hospital.count({ where: { status: "ACTIVE" } }),
  ])

  return { totalVaccines, activeVaccines, hospitalCount }
}

async function getVaccinesByHospital() {
  return prisma.hospital.findMany({
    where: { status: "ACTIVE" },
    include: {
      vaccines: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })
}

export default async function VaccinesPage() {
  const stats = await getVaccineStats()
  const hospitalVaccines = await getVaccinesByHospital()

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <Syringe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Vaccine Overview</h2>
            <p className="text-white/80">
              View all vaccines configured across hospitals
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Syringe className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Vaccines</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalVaccines}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">across all hospitals</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-600">
              Active
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Vaccines</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeVaccines}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">currently in use</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Hospitals</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.hospitalCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">with vaccine programs</p>
          </div>
        </div>
      </div>

      {/* Vaccines by Hospital */}
      <div className="space-y-6">
        {hospitalVaccines.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400">No active hospitals found</p>
          </div>
        ) : (
          hospitalVaccines.map((hospital) => (
            <div key={hospital.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Link 
                        href={`/super-admin/hospitals/${hospital.id}`}
                        className="text-lg font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1"
                      >
                        {hospital.name}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {hospital.vaccines.length} vaccine{hospital.vaccines.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-lg px-3 py-1 border-slate-300 dark:border-slate-600">
                    {hospital.slug}
                  </Badge>
                </div>
              </div>
              <div className="p-6">
                {hospital.vaccines.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                    No vaccines configured yet
                  </p>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Vaccine</TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Description</TableHead>
                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Doses</TableHead>
                          <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hospital.vaccines.map((vaccine) => (
                          <TableRow key={vaccine.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700">
                            <TableCell className="font-medium text-slate-900 dark:text-white">{vaccine.name}</TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 max-w-md truncate">
                              {vaccine.description || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold">
                                {vaccine.dosesRequired}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {vaccine.isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 text-sm font-medium">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </span>
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
          ))
        )}
      </div>
    </div>
  )
}
