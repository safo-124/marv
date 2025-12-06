"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"

interface Hospital {
  id: string
  name: string
}

export function ExportDataButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loadingHospitals, setLoadingHospitals] = useState(false)
  
  const [exportType, setExportType] = useState<string>("")
  const [hospitalId, setHospitalId] = useState<string>("all")

  useEffect(() => {
    if (open && hospitals.length === 0) {
      loadHospitals()
    }
  }, [open])

  async function loadHospitals() {
    setLoadingHospitals(true)
    try {
      const response = await fetch("/api/super-admin/hospitals")
      const data = await response.json()
      setHospitals(data)
    } catch (error) {
      console.error("Failed to load hospitals:", error)
    } finally {
      setLoadingHospitals(false)
    }
  }

  async function handleExport() {
    if (!exportType) {
      toast.error("Please select an export type")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/super-admin/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: exportType,
          hospitalId: hospitalId === "all" ? null : hospitalId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create export")
      }

      toast.success("Export started. You can download it when ready.")
      setOpen(false)
      setExportType("")
      setHospitalId("all")
      router.refresh()
    } catch (error) {
      toast.error("Failed to create export")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 border-0">
          <Download className="h-4 w-4 mr-2" />
          New Export
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Export Data</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Generate a data export for download. Large exports may take a few minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Export Type</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <SelectValue placeholder="Select data to export" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectItem value="MOTHERS">Mothers</SelectItem>
                <SelectItem value="CHILDREN">Children</SelectItem>
                <SelectItem value="IMMUNIZATIONS">Immunization Records</SelectItem>
                <SelectItem value="FULL">Full Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Hospital (Optional)</Label>
            <Select value={hospitalId} onValueChange={setHospitalId}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <SelectValue placeholder={loadingHospitals ? "Loading..." : "All hospitals"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leave as &quot;All Hospitals&quot; to export data from all hospitals
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading || !exportType} className="bg-violet-600 hover:bg-violet-700 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
