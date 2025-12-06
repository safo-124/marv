"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreateHospitalAdminDialog } from "./create-hospital-admin-dialog"
import { toast } from "sonner"
import { 
  MoreHorizontal, 
  UserCog, 
  Power, 
  PowerOff, 
  Trash2, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"

interface Admin {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    phone?: string | null
    isActive: boolean
    createdAt: Date
  }
}

interface HospitalAdminsListProps {
  hospitalId: string
  hospitalName: string
  admins: Admin[]
}

export function HospitalAdminsList({ hospitalId, hospitalName, admins }: HospitalAdminsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null)

  async function toggleAdminStatus(admin: Admin) {
    setIsLoading(admin.id)
    try {
      const response = await fetch(`/api/super-admin/hospitals/${hospitalId}/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.user.isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update admin")
      }

      toast.success(`Admin ${admin.user.isActive ? "deactivated" : "activated"} successfully`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update admin")
    } finally {
      setIsLoading(null)
    }
  }

  async function deleteAdmin(admin: Admin) {
    setIsLoading(admin.id)
    try {
      const response = await fetch(`/api/super-admin/hospitals/${hospitalId}/admins/${admin.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete admin")
      }

      toast.success("Admin removed successfully")
      setDeleteDialogOpen(false)
      setAdminToDelete(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete admin")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {admins.length} administrator{admins.length !== 1 ? "s" : ""}
        </p>
        <CreateHospitalAdminDialog hospitalId={hospitalId} hospitalName={hospitalName} />
      </div>
      
      {admins.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            No administrators assigned yet
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Click &quot;Add Admin&quot; to create the first administrator for this hospital.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => (
            <div 
              key={admin.id} 
              className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <UserCog className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {admin.user.name || "Unnamed Admin"}
                      </p>
                      <Badge className={admin.user.isActive 
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30" 
                        : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30"
                      }>
                        {admin.user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {admin.user.email}
                      </span>
                      {admin.user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {admin.user.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Added {format(new Date(admin.user.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      disabled={isLoading === admin.id}
                    >
                      {isLoading === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DropdownMenuItem 
                      onClick={() => toggleAdminStatus(admin)}
                      className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-700"
                    >
                      {admin.user.isActive ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2 text-amber-500" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2 text-emerald-500" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={() => {
                        setAdminToDelete(admin)
                        setDeleteDialogOpen(true)
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Remove Hospital Admin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to remove <strong>{adminToDelete?.user.name}</strong> as an admin? 
              This will revoke their access to {hospitalName}. The user account will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => adminToDelete && deleteAdmin(adminToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading === adminToDelete?.id}
            >
              {isLoading === adminToDelete?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
