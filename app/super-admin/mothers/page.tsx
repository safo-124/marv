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
import { Users, Baby, Building2, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

async function getMotherStats() {
  const [totalMothers, totalChildren, recentMothers] = await Promise.all([
    prisma.mother.count(),
    prisma.child.count(),
    prisma.mother.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return { totalMothers, totalChildren, recentMothers }
}

async function getMothers() {
  return prisma.mother.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      currentHospital: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: { children: true },
      },
    },
  })
}

export default async function MothersPage() {
  const stats = await getMotherStats()
  const mothers = await getMothers()

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Mothers Overview</h2>
            <p className="text-white/80">
              View all registered mothers across hospitals
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Mothers</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMothers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">registered in the system</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Children</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalChildren}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">under immunization care</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-600">
              <TrendingUp className="h-3 w-3" />
              New
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">New This Month</h3>
            <p className="text-3xl font-bold text-green-600">{stats.recentMothers}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">mothers registered</p>
          </div>
        </div>
      </div>

      {/* Mothers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Mothers</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing the most recently registered mothers (max 100)
          </p>
        </div>
        <div className="p-6">
          {mothers.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">No mothers registered yet</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Contact</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Hospital</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">Children</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mothers.map((mother) => (
                    <TableRow key={mother.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700">
                      <TableCell>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {mother.firstName} {mother.lastName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {mother.phone}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900 dark:text-white">{mother.phone}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{mother.email || "-"}</p>
                      </TableCell>
                      <TableCell>
                        {mother.currentHospital ? (
                          <Link 
                            href={`/super-admin/hospitals/${mother.currentHospital.id}`}
                            className="text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1"
                          >
                            {mother.currentHospital.name}
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold text-sm">
                          {mother._count.children}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {format(new Date(mother.createdAt), "MMM d, yyyy")}
                        </p>
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
