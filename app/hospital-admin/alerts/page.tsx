"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

interface PerformanceAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
  message: string;
  threshold: number | null;
  actualValue: number | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolvedNote: string | null;
  triggeredAt: string;
  acknowledgedBy: {
    name: string;
  } | null;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"acknowledge" | "resolve">("acknowledge");
  const [resolutionNote, setResolutionNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [activeTab]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") {
        params.set("status", activeTab.toUpperCase());
      }
      const res = await fetch(`/api/hospital-admin/alerts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedAlert) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospital-admin/alerts/${selectedAlert.id}/${actionType}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionNote }),
      });
      if (res.ok) {
        setActionDialogOpen(false);
        setSelectedAlert(null);
        setResolutionNote("");
        fetchAlerts();
      }
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      setSaving(false);
    }
  };

  const openActionDialog = (alert: PerformanceAlert, type: "acknowledge" | "resolve") => {
    setSelectedAlert(alert);
    setActionType(type);
    setResolutionNote("");
    setActionDialogOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "ACKNOWLEDGED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Eye className="h-3 w-3 mr-1" />
            Acknowledged
          </Badge>
        );
      case "ESCALATED":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Escalated
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "OVERDUE_THRESHOLD":
        return "Overdue Threshold Exceeded";
      case "COMPLETION_DROP":
        return "Completion Rate Drop";
      case "INACTIVE":
        return "Inactivity Alert";
      default:
        return type;
    }
  };

  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "ACKNOWLEDGED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Alerts</h1>
          <p className="text-gray-600">Monitor and respond to performance issues</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <Bell className="h-5 w-5 text-red-600" />
            <span className="text-red-700 font-medium">{pendingCount} pending alert{pendingCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Pending</p>
                <p className="text-2xl font-bold text-red-900">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Acknowledged</p>
                <p className="text-2xl font-bold text-blue-900">{acknowledgedCount}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved (30d)</p>
                <p className="text-2xl font-bold text-green-900">
                  {alerts.filter((a) => a.status === "RESOLVED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Critical</p>
                <p className="text-2xl font-bold text-amber-900">
                  {alerts.filter((a) => a.severity === "CRITICAL" && a.status !== "RESOLVED").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:text-red-600 text-gray-600"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger
            value="acknowledged"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            Acknowledged
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 text-gray-600"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolved
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
          >
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-900">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No alerts in this category</p>
                  {activeTab === "pending" && (
                    <p className="text-sm text-gray-400">Great job! All alerts have been addressed.</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Alert</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Severity</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Value</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Created</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          alert.severity === "CRITICAL" && alert.status === "PENDING"
                            ? "bg-red-50/50"
                            : ""
                        }`}
                      >
                        <TableCell>
                          <div className="font-medium text-gray-900">{getAlertTypeLabel(alert.type)}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {alert.message}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {alert.type}
                        </TableCell>
                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell>{getStatusBadge(alert.status)}</TableCell>
                        <TableCell className="text-gray-700">
                          {alert.actualValue !== null && alert.threshold !== null ? (
                            <span className={alert.actualValue > alert.threshold ? "text-red-600 font-medium" : ""}>
                              {alert.actualValue}% / {alert.threshold}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(alert.triggeredAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {alert.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionDialog(alert, "acknowledge")}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            {(alert.status === "PENDING" || alert.status === "ACKNOWLEDGED") && (
                              <Button
                                size="sm"
                                onClick={() => openActionDialog(alert, "resolve")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                            {alert.status === "RESOLVED" && alert.resolvedNote && (
                              <span className="text-sm text-gray-500 italic">
                                {alert.resolvedNote.slice(0, 30)}...
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {actionType === "acknowledge" ? "Acknowledge Alert" : "Resolve Alert"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {actionType === "acknowledge"
                ? "Mark this alert as acknowledged to indicate you're aware of the issue."
                : "Mark this alert as resolved and optionally add resolution notes."
              }
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  {getStatusBadge(selectedAlert.status)}
                </div>
                <div className="font-medium text-gray-900">{getAlertTypeLabel(selectedAlert.type)}</div>
                <div className="text-sm text-gray-600 mt-1">{selectedAlert.message}</div>
              </div>
              {actionType === "resolve" && (
                <div className="space-y-2">
                  <Label className="text-gray-700">Resolution Notes</Label>
                  <Textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Describe how this issue was resolved..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={saving}
              className={
                actionType === "acknowledge"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === "acknowledge" ? "Acknowledge" : "Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
