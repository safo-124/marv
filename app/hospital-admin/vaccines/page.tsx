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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Syringe,
  Plus,
  MoreHorizontal,
  History,
  Pencil,
  Upload,
  Search,
  AlertCircle,
  Loader2,
  Filter,
  X,
} from "lucide-react";

interface Vaccine {
  id: string;
  name: string;
  shortName: string;
  description: string | null;
  manufacturer: string | null;
  dosesRequired: number;
  minAgeWeeks: number;
  maxAgeWeeks: number | null;
  intervalWeeks: number | null;
  reminderDaysBefore: number;
  isActive: boolean;
  currentVersionId: string | null;
  createdAt: string;
  _count: {
    versions: number;
    immunizationRecords: number;
  };
}

interface VaccineVersion {
  id: string;
  versionNumber: number;
  name: string;
  minAgeWeeks: number;
  maxAgeWeeks: number | null;
  intervalWeeks: number | null;
  dosesRequired: number;
  changeReason: string | null;
  changedAt: string;
  changedBy: {
    name: string;
  };
}

export default function VaccinesPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [versions, setVersions] = useState<VaccineVersion[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
    manufacturer: "",
    dosesRequired: 1,
    minAgeWeeks: 0,
    maxAgeWeeks: "",
    intervalWeeks: "",
    reminderDaysBefore: 3,
    changeReason: "",
  });

  useEffect(() => {
    fetchVaccines();
  }, [showActiveOnly]);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showActiveOnly) params.set("activeOnly", "true");
      const res = await fetch(`/api/hospital-admin/vaccines?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVaccines(data);
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (vaccineId: string) => {
    try {
      const res = await fetch(`/api/hospital-admin/vaccines/${vaccineId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/vaccines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxAgeWeeks: formData.maxAgeWeeks ? parseInt(formData.maxAgeWeeks) : null,
          intervalWeeks: formData.intervalWeeks ? parseInt(formData.intervalWeeks) : null,
        }),
      });
      if (res.ok) {
        setAddDialogOpen(false);
        resetForm();
        fetchVaccines();
      }
    } catch (error) {
      console.error("Error adding vaccine:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedVaccine) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospital-admin/vaccines/${selectedVaccine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxAgeWeeks: formData.maxAgeWeeks ? parseInt(formData.maxAgeWeeks) : null,
          intervalWeeks: formData.intervalWeeks ? parseInt(formData.intervalWeeks) : null,
        }),
      });
      if (res.ok) {
        setEditDialogOpen(false);
        resetForm();
        fetchVaccines();
      }
    } catch (error) {
      console.error("Error updating vaccine:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (vaccine: Vaccine) => {
    try {
      const res = await fetch(`/api/hospital-admin/vaccines/${vaccine.id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchVaccines();
      }
    } catch (error) {
      console.error("Error toggling vaccine:", error);
    }
  };

  const openEditDialog = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      shortName: vaccine.shortName,
      description: vaccine.description || "",
      manufacturer: vaccine.manufacturer || "",
      dosesRequired: vaccine.dosesRequired,
      minAgeWeeks: vaccine.minAgeWeeks,
      maxAgeWeeks: vaccine.maxAgeWeeks?.toString() || "",
      intervalWeeks: vaccine.intervalWeeks?.toString() || "",
      reminderDaysBefore: vaccine.reminderDaysBefore,
      changeReason: "",
    });
    setEditDialogOpen(true);
  };

  const openHistoryDialog = async (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    await fetchVersions(vaccine.id);
    setHistoryDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      shortName: "",
      description: "",
      manufacturer: "",
      dosesRequired: 1,
      minAgeWeeks: 0,
      maxAgeWeeks: "",
      intervalWeeks: "",
      reminderDaysBefore: 3,
      changeReason: "",
    });
    setSelectedVaccine(null);
  };

  const formatAge = (weeks: number | null) => {
    if (weeks === null) return "—";
    if (weeks < 4) return `${weeks} weeks`;
    const months = Math.floor(weeks / 4);
    const remainingWeeks = weeks % 4;
    if (remainingWeeks === 0) return `${months} months`;
    return `${months}m ${remainingWeeks}w`;
  };

  const filteredVaccines = vaccines.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vaccine Catalog</h1>
          <p className="text-gray-600">Manage your hospital&apos;s vaccine inventory and schedules</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Import Vaccines</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Import standard vaccine schedules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">
                  Import standard vaccination schedules recommended by the Uganda National Immunization Programme.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Standard Vaccines</span>
                  </div>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• BCG (Birth)</li>
                    <li>• OPV (Birth, 6w, 10w, 14w)</li>
                    <li>• Pentavalent (6w, 10w, 14w)</li>
                    <li>• PCV (6w, 10w, 14w)</li>
                    <li>• Rotavirus (6w, 10w)</li>
                    <li>• Measles (9m, 18m)</li>
                    <li>• Yellow Fever (9m)</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/api/hospital-admin/vaccines/import", {
                        method: "POST",
                      });
                      if (res.ok) {
                        setImportDialogOpen(false);
                        fetchVaccines();
                      }
                    } catch (error) {
                      console.error("Error importing vaccines:", error);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import Standard Vaccines
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Vaccine
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Add New Vaccine</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new vaccine for your hospital
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Vaccine Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pentavalent"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Short Name *</Label>
                  <Input
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="e.g., DPT-HepB-Hib"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Vaccine description..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., Serum Institute"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Doses Required *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.dosesRequired}
                    onChange={(e) => setFormData({ ...formData, dosesRequired: parseInt(e.target.value) || 1 })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Min Age (weeks) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minAgeWeeks}
                    onChange={(e) => setFormData({ ...formData, minAgeWeeks: parseInt(e.target.value) || 0 })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Max Age (weeks)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.maxAgeWeeks}
                    onChange={(e) => setFormData({ ...formData, maxAgeWeeks: e.target.value })}
                    placeholder="Optional"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Interval Between Doses (weeks)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.intervalWeeks}
                    onChange={(e) => setFormData({ ...formData, intervalWeeks: e.target.value })}
                    placeholder="For multi-dose vaccines"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Reminder Days Before</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.reminderDaysBefore}
                    onChange={(e) => setFormData({ ...formData, reminderDaysBefore: parseInt(e.target.value) || 3 })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={saving || !formData.name || !formData.shortName}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Vaccine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vaccines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active only</span>
              <Switch
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vaccines Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-gray-900">Vaccines ({filteredVaccines.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredVaccines.length === 0 ? (
            <div className="text-center py-12">
              <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No vaccines found</p>
              <p className="text-sm text-gray-400">
                {vaccines.length === 0 
                  ? "Add vaccines or import standard schedules to get started"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">Vaccine</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Doses</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Age Range</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Interval</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Records</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVaccines.map((vaccine) => (
                  <TableRow key={vaccine.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{vaccine.name}</div>
                        <div className="text-sm text-gray-500">{vaccine.shortName}</div>
                        {vaccine.manufacturer && (
                          <div className="text-xs text-gray-400">{vaccine.manufacturer}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{vaccine.dosesRequired}</TableCell>
                    <TableCell className="text-gray-700">
                      {formatAge(vaccine.minAgeWeeks)}
                      {vaccine.maxAgeWeeks && ` - ${formatAge(vaccine.maxAgeWeeks)}`}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {vaccine.intervalWeeks ? `${vaccine.intervalWeeks} weeks` : "—"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {vaccine._count.immunizationRecords}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={vaccine.isActive ? "default" : "secondary"}
                        className={vaccine.isActive 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                        }
                      >
                        {vaccine.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(vaccine)}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openHistoryDialog(vaccine)}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <History className="h-4 w-4 mr-2" />
                            Version History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200" />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(vaccine)}
                            className={vaccine.isActive 
                              ? "text-amber-600 hover:bg-amber-50" 
                              : "text-green-600 hover:bg-green-50"
                            }
                          >
                            {vaccine.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Vaccine</DialogTitle>
            <DialogDescription className="text-gray-600">
              Changes will create a new version for tracking
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Vaccine Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Short Name *</Label>
              <Input
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Doses Required *</Label>
              <Input
                type="number"
                min="1"
                value={formData.dosesRequired}
                onChange={(e) => setFormData({ ...formData, dosesRequired: parseInt(e.target.value) || 1 })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Min Age (weeks) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.minAgeWeeks}
                onChange={(e) => setFormData({ ...formData, minAgeWeeks: parseInt(e.target.value) || 0 })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Max Age (weeks)</Label>
              <Input
                type="number"
                min="0"
                value={formData.maxAgeWeeks}
                onChange={(e) => setFormData({ ...formData, maxAgeWeeks: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Interval Between Doses (weeks)</Label>
              <Input
                type="number"
                min="1"
                value={formData.intervalWeeks}
                onChange={(e) => setFormData({ ...formData, intervalWeeks: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Reminder Days Before</Label>
              <Input
                type="number"
                min="1"
                value={formData.reminderDaysBefore}
                onChange={(e) => setFormData({ ...formData, reminderDaysBefore: parseInt(e.target.value) || 3 })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700">Reason for Change</Label>
              <Input
                value={formData.changeReason}
                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
                placeholder="e.g., Updated age range per new guidelines"
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={saving || !formData.name || !formData.shortName}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Version History: {selectedVaccine?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Track all changes made to this vaccine
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {versions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No version history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Version {version.versionNumber}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(version.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Doses:</span>{" "}
                        <span className="text-gray-900">{version.dosesRequired}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Age:</span>{" "}
                        <span className="text-gray-900">{formatAge(version.minAgeWeeks)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Interval:</span>{" "}
                        <span className="text-gray-900">
                          {version.intervalWeeks ? `${version.intervalWeeks}w` : "—"}
                        </span>
                      </div>
                    </div>
                    {version.changeReason && (
                      <p className="text-sm text-gray-600 italic">
                        &ldquo;{version.changeReason}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Changed by {version.changedBy.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
