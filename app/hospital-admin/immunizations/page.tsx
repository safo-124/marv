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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Syringe,
  Search,
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";

interface Schedule {
  id: string;
  doseNumber: number;
  scheduledDate: string;
  status: string;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    mother: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  vaccine: {
    id: string;
    name: string;
    shortName: string;
  };
}

interface ImmunizationRecord {
  id: string;
  administeredAt: string;
  batchNumber: string | null;
  notes: string | null;
  doseNumber: number;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    mother: {
      firstName: string;
      lastName: string;
    };
  };
  vaccine: {
    name: string;
    shortName: string;
  };
  recordedBy: {
    name: string;
  } | null;
}

export default function ImmunizationsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("due");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [recordFormData, setRecordFormData] = useState({
    administeredDate: new Date().toISOString().split("T")[0],
    batchNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (activeTab === "due" || activeTab === "overdue") {
      fetchSchedules();
    } else {
      fetchRecords();
    }
  }, [activeTab, statusFilter]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "overdue") {
        params.set("status", "OVERDUE");
      } else if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/hospital-admin/immunizations/schedules?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital-admin/immunizations/records");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordImmunization = async () => {
    if (!selectedSchedule) return;
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/immunizations/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          childId: selectedSchedule.child.id,
          vaccineId: selectedSchedule.vaccine.id,
          doseNumber: selectedSchedule.doseNumber,
          ...recordFormData,
        }),
      });
      if (res.ok) {
        setRecordDialogOpen(false);
        setSelectedSchedule(null);
        setRecordFormData({
          administeredDate: new Date().toISOString().split("T")[0],
          batchNumber: "",
          notes: "",
        });
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error recording immunization:", error);
    } finally {
      setSaving(false);
    }
  };

  const openRecordDialog = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setRecordFormData({
      administeredDate: new Date().toISOString().split("T")[0],
      batchNumber: "",
      notes: "",
    });
    setRecordDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "MISSED":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Missed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChildAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const diffTime = today.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  const filteredSchedules = schedules.filter(
    (s) =>
      s.child.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.child.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vaccine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.child.mother.phone.includes(searchQuery)
  );

  const filteredRecords = records.filter(
    (r) =>
      r.child.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.child.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vaccine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dueTodayCount = schedules.filter((s) => {
    const today = new Date().toISOString().split("T")[0];
    const scheduled = new Date(s.scheduledDate).toISOString().split("T")[0];
    return scheduled === today && s.status !== "COMPLETED";
  }).length;

  const overdueCount = schedules.filter((s) => s.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Immunizations</h1>
          <p className="text-gray-600">Manage vaccination schedules and records</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-600 font-medium">{dueTodayCount}</span>
            <span className="text-blue-700 ml-1">due today</span>
          </div>
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-600 font-medium">{overdueCount}</span>
            <span className="text-red-700 ml-1">overdue</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by child name, vaccine, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900"
              />
            </div>
            {(activeTab === "due") && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all" className="text-gray-900">All statuses</SelectItem>
                    <SelectItem value="SCHEDULED" className="text-gray-900">Scheduled</SelectItem>
                    <SelectItem value="OVERDUE" className="text-gray-900">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger
            value="due"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Due Schedules
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="data-[state=active]:bg-white data-[state=active]:text-red-600 text-gray-600"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Overdue ({overdueCount})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 text-gray-600"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="due">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-900">Upcoming & Due Immunizations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No immunizations found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Child</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Vaccine</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Dose</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Scheduled</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Mother</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {schedule.child.firstName} {schedule.child.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Age: {getChildAge(schedule.child.dateOfBirth)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900">{schedule.vaccine.name}</div>
                          <div className="text-xs text-gray-500">{schedule.vaccine.shortName}</div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          Dose {schedule.doseNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="h-3 w-3" />
                            {new Date(schedule.scheduledDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(schedule.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-700">
                            {schedule.child.mother.firstName} {schedule.child.mother.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{schedule.child.mother.phone}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openRecordDialog(schedule)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Syringe className="h-4 w-4 mr-1" />
                            Record
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-red-50">
              <CardTitle className="text-red-900">Overdue Immunizations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No overdue immunizations!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Child</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Vaccine</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Dose</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Was Due</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Days Overdue</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Contact</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(schedule.scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={schedule.id} className="border-b border-gray-100 hover:bg-red-50/50">
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {schedule.child.firstName} {schedule.child.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Age: {getChildAge(schedule.child.dateOfBirth)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-900">{schedule.vaccine.name}</div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            Dose {schedule.doseNumber}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {new Date(schedule.scheduledDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              {daysOverdue} days
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-700">{schedule.child.mother.phone}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => openRecordDialog(schedule)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Syringe className="h-4 w-4 mr-1" />
                              Record
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-green-50">
              <CardTitle className="text-green-900">Completed Immunizations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed immunizations yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Child</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Vaccine</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Dose</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Administered</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Batch #</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Given By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {record.child.firstName} {record.child.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.child.mother.firstName} {record.child.mother.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900">{record.vaccine.name}</div>
                          <div className="text-xs text-gray-500">{record.vaccine.shortName}</div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          Dose {record.doseNumber}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {new Date(record.administeredAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {record.batchNumber || "—"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {record.recordedBy?.name || "—"}
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

      {/* Record Immunization Dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Record Immunization</DialogTitle>
            <DialogDescription className="text-gray-600">
              Record that this vaccine dose has been administered
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>Child:</strong> {selectedSchedule.child.firstName} {selectedSchedule.child.lastName}
                </div>
                <div className="text-sm text-blue-700">
                  <strong>Vaccine:</strong> {selectedSchedule.vaccine.name} - Dose {selectedSchedule.doseNumber}
                </div>
                <div className="text-sm text-blue-700">
                  <strong>Scheduled:</strong> {new Date(selectedSchedule.scheduledDate).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Administration Date *</Label>
                <Input
                  type="date"
                  value={recordFormData.administeredDate}
                  onChange={(e) =>
                    setRecordFormData({ ...recordFormData, administeredDate: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Batch Number</Label>
                <Input
                  value={recordFormData.batchNumber}
                  onChange={(e) =>
                    setRecordFormData({ ...recordFormData, batchNumber: e.target.value })
                  }
                  placeholder="e.g., VAX-2024-001"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Notes</Label>
                <Textarea
                  value={recordFormData.notes}
                  onChange={(e) =>
                    setRecordFormData({ ...recordFormData, notes: e.target.value })
                  }
                  placeholder="Any observations or notes..."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordImmunization}
              disabled={saving || !recordFormData.administeredDate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record Immunization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
