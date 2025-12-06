"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Building2,
  Users,
  Baby,
  Syringe,
  FileSpreadsheet,
  FileBarChart,
  Filter,
  Play,
  Pause,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock data for scheduled reports
const scheduledReports = [
  {
    id: "1",
    name: "Weekly Immunization Summary",
    type: "immunizations",
    schedule: "Weekly (Monday 8:00 AM)",
    format: "xlsx",
    status: "active",
    lastRun: "2024-01-08T08:00:00Z",
    nextRun: "2024-01-15T08:00:00Z",
  },
  {
    id: "2",
    name: "Monthly Hospital Performance",
    type: "hospitals",
    schedule: "Monthly (1st, 9:00 AM)",
    format: "pdf",
    status: "active",
    lastRun: "2024-01-01T09:00:00Z",
    nextRun: "2024-02-01T09:00:00Z",
  },
  {
    id: "3",
    name: "Daily Registration Report",
    type: "registrations",
    schedule: "Daily (6:00 PM)",
    format: "csv",
    status: "paused",
    lastRun: "2024-01-10T18:00:00Z",
    nextRun: null,
  },
]

// Report templates
const reportTemplates = [
  {
    id: "immunizations",
    name: "Immunization Report",
    description: "Detailed report of all immunizations with vaccine types, dates, and coverage rates",
    icon: Syringe,
    color: "from-emerald-500 to-green-600",
    fields: ["date_range", "hospital", "vaccine_type", "status"],
  },
  {
    id: "hospitals",
    name: "Hospital Performance",
    description: "Hospital-level metrics including registrations, workers, and immunization counts",
    icon: Building2,
    color: "from-violet-500 to-purple-600",
    fields: ["date_range", "hospital", "metrics"],
  },
  {
    id: "mothers",
    name: "Mothers Registry",
    description: "Complete list of registered mothers with demographics and children counts",
    icon: Users,
    color: "from-pink-500 to-rose-600",
    fields: ["date_range", "hospital", "district"],
  },
  {
    id: "children",
    name: "Children Registry",
    description: "All registered children with birth information and immunization status",
    icon: Baby,
    color: "from-cyan-500 to-blue-600",
    fields: ["date_range", "hospital", "age_range"],
  },
  {
    id: "coverage",
    name: "Coverage Analysis",
    description: "Vaccine coverage rates by region, hospital, and demographic groups",
    icon: FileBarChart,
    color: "from-amber-500 to-orange-600",
    fields: ["date_range", "vaccine_type", "region"],
  },
  {
    id: "compliance",
    name: "Compliance Report",
    description: "Overdue and missed immunizations, at-risk children identification",
    icon: FileText,
    color: "from-red-500 to-rose-600",
    fields: ["date_range", "hospital", "severity"],
  },
]

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleGenerateReport = async (templateId: string) => {
    setGenerating(templateId)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGenerating(null)
    // In a real app, this would trigger a download
    alert(`Report generated successfully! Download will start shortly.`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Generate and schedule custom reports
          </p>
        </div>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                Schedule New Report
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Set up an automated report to run on a schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Report Name
                </Label>
                <Input
                  placeholder="e.g., Weekly Summary"
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Report Type
                </Label>
                <select className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                  {reportTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Schedule
                </Label>
                <select className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Format
                </Label>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg border-2 border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600 font-medium">
                    Excel
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                    PDF
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                    CSV
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Email Recipients
                </Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                className="border-slate-200 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Generate Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => {
            const IconComponent = template.icon
            const isGenerating = generating === template.id

            return (
              <div
                key={template.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={isGenerating}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-200 dark:border-slate-600"
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setShowScheduleDialog(true)
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Scheduled Reports
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Report
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Schedule
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Format
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Last Run
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {report.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {report.type}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {report.schedule}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium uppercase">
                        {report.format}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(report.lastRun).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {report.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Paused
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                          title={
                            report.status === "active" ? "Pause" : "Resume"
                          }
                        >
                          {report.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                          title="Download Last Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scheduledReports.length === 0 && (
            <div className="p-12 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                No scheduled reports yet
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Schedule
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {scheduledReports.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Scheduled Reports
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {scheduledReports.filter((r) => r.status === "active").length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active Schedules
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {reportTemplates.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Report Templates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
