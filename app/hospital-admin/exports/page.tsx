"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface DataExport {
  id: string;
  type: string;
  format: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  recordCount: number | null;
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
}

const exportTypes = [
  { value: "MOTHERS", label: "Mothers", description: "All registered mothers" },
  { value: "CHILDREN", label: "Children", description: "All registered children" },
  { value: "IMMUNIZATIONS", label: "Immunization Records", description: "All immunization records" },
  { value: "SCHEDULES", label: "Immunization Schedules", description: "All immunization schedules" },
  { value: "HEALTH_WORKERS", label: "Health Workers", description: "All health worker data" },
  { value: "ALERTS", label: "Performance Alerts", description: "All performance alerts" },
  { value: "FULL_REPORT", label: "Full Hospital Report", description: "Complete hospital data export" },
];

export default function ExportsPage() {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // New export form state
  const [selectedType, setSelectedType] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [dateRange, setDateRange] = useState("ALL");

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      const response = await fetch("/api/hospital-admin/exports");
      if (!response.ok) throw new Error("Failed to fetch exports");
      const data = await response.json();
      setExports(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select an export type",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/hospital-admin/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          format: selectedFormat,
          includeArchived,
          dateRange,
        }),
      });

      if (!response.ok) throw new Error("Failed to create export");

      toast({
        title: "Export Started",
        description: "Your export is being processed. It will appear in the list shortly.",
      });

      setIsDialogOpen(false);
      setSelectedType("");
      setSelectedFormat("CSV");
      setIncludeArchived(false);
      setDateRange("ALL");
      fetchExports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create export",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (exportItem: DataExport) => {
    if (exportItem.status !== "COMPLETED" || !exportItem.fileName) {
      toast({
        title: "Error",
        description: "Export is not ready for download",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/hospital-admin/exports/${exportItem.id}/download`);
      if (!response.ok) throw new Error("Failed to download");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportItem.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download export",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "PROCESSING":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "EXPIRED":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "CSV":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case "XLSX":
        return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
      case "PDF":
        return <FileText className="w-4 h-4 text-red-600" />;
      case "JSON":
        return <FileText className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Exports</h1>
          <p className="text-gray-600">Export hospital data in various formats</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Export</DialogTitle>
              <DialogDescription>
                Select the data type and format for your export
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-gray-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        CSV (Comma Separated)
                      </div>
                    </SelectItem>
                    <SelectItem value="XLSX">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        XLSX (Excel)
                      </div>
                    </SelectItem>
                    <SelectItem value="JSON">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-yellow-600" />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="PDF">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        PDF Report
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                    <SelectItem value="LAST_MONTH">Last Month</SelectItem>
                    <SelectItem value="THIS_QUARTER">This Quarter</SelectItem>
                    <SelectItem value="THIS_YEAR">This Year</SelectItem>
                    <SelectItem value="LAST_YEAR">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeArchived"
                  checked={includeArchived}
                  onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
                />
                <Label htmlFor="includeArchived" className="text-sm font-normal cursor-pointer">
                  Include archived/inactive records
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExport} disabled={isCreating || !selectedType}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Create Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Export Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setSelectedType("MOTHERS");
          setSelectedFormat("CSV");
          setIsDialogOpen(true);
        }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-pink-600" />
              Mothers Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Export all registered mothers data</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setSelectedType("CHILDREN");
          setSelectedFormat("CSV");
          setIsDialogOpen(true);
        }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Children Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Export all registered children data</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setSelectedType("IMMUNIZATIONS");
          setSelectedFormat("CSV");
          setIsDialogOpen(true);
        }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Immunizations Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Export immunization records</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          setSelectedType("FULL_REPORT");
          setSelectedFormat("PDF");
          setIsDialogOpen(true);
        }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Full Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Complete hospital data report</p>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export History</CardTitle>
              <CardDescription>View and download your previous exports</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchExports}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-12">
              <Download className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No exports yet</h3>
              <p className="text-gray-600">Create your first export to download hospital data</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Export
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exportItem) => (
                  <TableRow key={exportItem.id}>
                    <TableCell className="font-medium">
                      {exportTypes.find((t) => t.value === exportItem.type)?.label || exportItem.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(exportItem.format)}
                        {exportItem.format}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exportItem.status)}</TableCell>
                    <TableCell>{exportItem.recordCount?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell>{formatFileSize(exportItem.fileSize)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exportItem.requestedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{exportItem.requestedBy?.name || "Unknown"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {exportItem.status === "COMPLETED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(exportItem)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {exportItem.status === "PROCESSING" && (
                        <span className="text-sm text-gray-500">Processing...</span>
                      )}
                      {exportItem.status === "FAILED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedType(exportItem.type);
                            setSelectedFormat(exportItem.format);
                            setIsDialogOpen(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      {exportItem.status === "EXPIRED" && (
                        <span className="text-sm text-gray-500">Expired</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Export Processing</p>
              <p>Large exports may take several minutes to process. You can leave this page and return later.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Download Availability</p>
              <p>Completed exports are available for download for 7 days. After that, they expire and must be regenerated.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Audit Trail</p>
              <p>All exports are logged for audit purposes. The system tracks who requested the export and when it was downloaded.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
