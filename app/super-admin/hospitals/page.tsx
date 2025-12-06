import prisma from "@/lib/prisma"
import { HospitalsTable } from "@/components/super-admin/hospitals-table"
import { CreateHospitalDialog } from "@/components/super-admin/create-hospital-dialog"
import { Building2, Activity, MapPin, Users, Baby, Stethoscope } from "lucide-react"

async function getHospitals() {
  return prisma.hospital.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          admins: true,
          healthWorkers: true,
          mothers: true,
          children: true,
        },
      },
    },
  })
}

async function getStats() {
  const [totalHospitals, activeHospitals, totalMothers, totalChildren, totalWorkers] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: "ACTIVE" } }),
    prisma.mother.count(),
    prisma.child.count(),
    prisma.healthWorker.count(),
  ])
  
  const districts = await prisma.hospital.groupBy({
    by: ['state'],
    where: { state: { not: null } },
    _count: true,
  })
  
  return {
    totalHospitals,
    activeHospitals,
    totalMothers,
    totalChildren,
    totalWorkers,
    districtsCount: districts.length,
  }
}

export default async function HospitalsPage() {
  const [hospitals, stats] = await Promise.all([getHospitals(), getStats()])

  return (
    <div className="space-y-6 pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Hospitals</h1>
              <p className="text-violet-100 text-lg">
                Manage healthcare facilities across Uganda 🇺🇬
              </p>
            </div>
          </div>
          <CreateHospitalDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Hospitals */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-violet-500 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalHospitals}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Hospitals</p>
        </div>

        {/* Active */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeHospitals}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Active</p>
        </div>

        {/* Districts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.districtsCount}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Districts</p>
        </div>

        {/* Mothers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-pink-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMothers.toLocaleString()}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Mothers</p>
        </div>

        {/* Children */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalChildren.toLocaleString()}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Children</p>
        </div>

        {/* Health Workers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalWorkers.toLocaleString()}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Health Workers</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Hospitals</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">View and manage registered healthcare facilities</p>
        </div>
        <div className="p-6">
          <HospitalsTable hospitals={hospitals} />
        </div>
      </div>
    </div>
  )
}
