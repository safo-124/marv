import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, Users, Baby, Syringe, UserCog, CheckCircle, Clock, AlertTriangle, MapPin, Phone, Mail, Hash, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { HospitalAdminsList } from "@/components/super-admin/hospital-admins-list"

interface HospitalDetailPageProps {
  params: Promise<{ id: string }>
}

async function getHospital(id: string) {
  return prisma.hospital.findUnique({
    where: { id },
    include: {
      notificationSettings: true,
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      },
      healthWorkers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      },
      _count: {
        select: {
          mothers: true,
          children: true,
          vaccines: true,
          immunizationRecords: true,
        },
      },
    },
  })
}

async function getHospitalStats(hospitalId: string) {
  const [
    totalMothers,
    totalChildren,
    totalVaccines,
    completedImmunizations,
    overdueImmunizations,
    scheduledImmunizations,
  ] = await Promise.all([
    prisma.mother.count({ where: { currentHospitalId: hospitalId } }),
    prisma.child.count({ where: { currentHospitalId: hospitalId } }),
    prisma.hospitalVaccine.count({ where: { hospitalId, isActive: true } }),
    prisma.immunizationSchedule.count({
      where: {
        child: { currentHospitalId: hospitalId },
        status: "COMPLETED",
      },
    }),
    prisma.immunizationSchedule.count({
      where: {
        child: { currentHospitalId: hospitalId },
        status: "OVERDUE",
      },
    }),
    prisma.immunizationSchedule.count({
      where: {
        child: { currentHospitalId: hospitalId },
        status: "SCHEDULED",
      },
    }),
  ])

  return {
    totalMothers,
    totalChildren,
    totalVaccines,
    completedImmunizations,
    overdueImmunizations,
    scheduledImmunizations,
  }
}

async function getRecentMothers(hospitalId: string) {
  return prisma.mother.findMany({
    where: { currentHospitalId: hospitalId },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { children: true },
      },
    },
  })
}

async function getRecentChildren(hospitalId: string) {
  return prisma.child.findMany({
    where: { currentHospitalId: hospitalId },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      mother: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}

export default async function HospitalDetailPage({ params }: HospitalDetailPageProps) {
  const { id } = await params
  const hospital = await getHospital(id)

  if (!hospital) {
    notFound()
  }

  const stats = await getHospitalStats(id)
  const recentMothers = await getRecentMothers(id)
  const recentChildren = await getRecentChildren(id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-semibold">
            <CheckCircle className="h-3 w-3" />
            Active
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 text-sm font-semibold">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-600 text-sm font-semibold">
            Suspended
          </span>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-white/20 rounded-xl text-white">
            <Link href="/super-admin/hospitals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{hospital.name}</h2>
              {getStatusBadge(hospital.status)}
            </div>
            <p className="text-white/80">{hospital.slug}.marv.ug</p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Mothers</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMothers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Baby className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Children</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalChildren}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Syringe className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Vaccines</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalVaccines}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <UserCog className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Health Workers</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{hospital.healthWorkers.length}</p>
          </div>
        </div>
      </div>

      {/* Immunization Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedImmunizations}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">immunizations</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledImmunizations}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">upcoming</p>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 shadow-lg border ${stats.overdueImmunizations > 0 ? "border-2 border-amber-400 dark:border-amber-500" : "border-slate-200 dark:border-slate-700"}`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg ${stats.overdueImmunizations > 0 ? "animate-pulse" : ""}`}>
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue</p>
              <p className={`text-2xl font-bold ${stats.overdueImmunizations > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>{stats.overdueImmunizations}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
          <TabsList className="w-full grid grid-cols-5 bg-transparent gap-2">
            <TabsTrigger value="info" className="rounded-xl text-slate-600 dark:text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white">Hospital Info</TabsTrigger>
            <TabsTrigger value="admins" className="rounded-xl text-slate-600 dark:text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white">Admins ({hospital.admins.length})</TabsTrigger>
            <TabsTrigger value="workers" className="rounded-xl text-slate-600 dark:text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white">Workers ({hospital.healthWorkers.length})</TabsTrigger>
            <TabsTrigger value="mothers" className="rounded-xl text-slate-600 dark:text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white">Mothers</TabsTrigger>
            <TabsTrigger value="children" className="rounded-xl text-slate-600 dark:text-slate-400 data-[state=active]:bg-violet-600 data-[state=active]:text-white">Children</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info">
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hospital Information</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Contact and location details</p>
            </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Address</p>
                    <p className="font-medium text-slate-900 dark:text-white">{hospital.address || "-"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">District</p>
                    <p className="font-medium text-slate-900 dark:text-white">{hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : hospital.city || hospital.state || "-"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <Phone className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-white">{hospital.phone || "-"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">{hospital.email || "-"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <Hash className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hospital Code</p>
                    <p className="font-medium text-slate-900 dark:text-white">{hospital.code || "-"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-start gap-3 border border-slate-200 dark:border-slate-600">
                  <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created</p>
                    <p className="font-medium text-slate-900 dark:text-white">{format(new Date(hospital.createdAt), "MMMM d, yyyy")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hospital Administrators</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Users with admin access to this hospital</p>
            </div>
            <div className="p-6">
              <HospitalAdminsList
                hospitalId={hospital.id}
                hospitalName={hospital.name}
                admins={hospital.admins}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workers">
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Health Workers</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nurses, midwives, and other staff</p>
            </div>
            <div className="p-6">
              {hospital.healthWorkers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <UserCog className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No health workers registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospital.healthWorkers.map((worker) => (
                    <div key={worker.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <UserCog className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{worker.user.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {worker.specialization || "Health Worker"} {worker.staffId && `• ${worker.staffId}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {worker.canRegisterMothers && (
                          <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 text-xs font-medium">Register</span>
                        )}
                        {worker.canRecordImmunizations && (
                          <span className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 text-xs font-medium">Immunize</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mothers">
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Mothers</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recently registered mothers</p>
            </div>
            <div className="p-6">
              {recentMothers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No mothers registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMothers.map((mother) => (
                    <div key={mother.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{mother.firstName} {mother.lastName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{mother.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{mother._count.children} children</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(mother.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="children">
          <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Children</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recently registered children</p>
            </div>
            <div className="p-6">
              {recentChildren.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Baby className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No children registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentChildren.map((child) => (
                    <div key={child.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Baby className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{child.firstName} {child.lastName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Mother: {child.mother.firstName} {child.mother.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{child.gender}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Born: {format(new Date(child.dateOfBirth), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
