"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MoreHorizontal,
  Search,
  ExternalLink,
  UserPlus,
  Edit,
  Ban,
  CheckCircle,
} from "lucide-react"
import { format } from "date-fns"
import type { HospitalStatus } from "@/app/generated/prisma/client"

interface Hospital {
  id: string
  name: string
  slug: string
  code: string | null
  city: string | null
  state: string | null
  status: HospitalStatus
  createdAt: Date
  _count: {
    admins: number
    healthWorkers: number
    mothers: number
    children: number
  }
}

interface HospitalsTableProps {
  hospitals: Hospital[]
}

export function HospitalsTable({ hospitals }: HospitalsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.state?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusChange = async (hospitalId: string, newStatus: HospitalStatus) => {
    try {
      await fetch(`/api/super-admin/hospitals/${hospitalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      router.refresh()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getStatusBadge = (status: HospitalStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700">Active</Badge>
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700">Pending</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Hospital</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Location</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
              <TableHead className="text-center text-slate-700 dark:text-slate-300 font-semibold">Admins</TableHead>
              <TableHead className="text-center text-slate-700 dark:text-slate-300 font-semibold">Workers</TableHead>
              <TableHead className="text-center text-slate-700 dark:text-slate-300 font-semibold">Mothers</TableHead>
              <TableHead className="text-center text-slate-700 dark:text-slate-300 font-semibold">Children</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHospitals.length === 0 ? (
              <TableRow className="border-slate-200 dark:border-slate-700">
                <TableCell colSpan={9} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {searchQuery ? "No hospitals found matching your search" : "No hospitals registered yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredHospitals.map((hospital) => (
                <TableRow key={hospital.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{hospital.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{hospital.slug}.marv.ug</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {hospital.city && hospital.state
                        ? `${hospital.city}, ${hospital.state}`
                        : hospital.city || hospital.state || "-"}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(hospital.status)}</TableCell>
                  <TableCell className="text-center font-medium text-slate-900 dark:text-white">{hospital._count.admins}</TableCell>
                  <TableCell className="text-center font-medium text-slate-900 dark:text-white">{hospital._count.healthWorkers}</TableCell>
                  <TableCell className="text-center font-medium text-slate-900 dark:text-white">{hospital._count.mothers}</TableCell>
                  <TableCell className="text-center font-medium text-slate-900 dark:text-white">{hospital._count.children}</TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(hospital.createdAt), "MMM d, yyyy")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DropdownMenuLabel className="text-slate-900 dark:text-white">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                        <DropdownMenuItem
                          onClick={() => router.push(`/super-admin/hospitals/${hospital.id}`)}
                          className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/super-admin/hospitals/${hospital.id}/edit`)}
                          className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Hospital
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/super-admin/hospitals/${hospital.id}/admins`)}
                          className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Manage Admins
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                        {hospital.status !== "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(hospital.id, "ACTIVE")}
                            className="text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-900/30"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {hospital.status !== "SUSPENDED" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(hospital.id, "SUSPENDED")}
                            className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
