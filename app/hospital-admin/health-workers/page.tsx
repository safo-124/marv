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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

interface HealthWorker {
  id: string;
  staffId: string | null;
  specialization: string | null;
  canRegisterMothers: boolean;
  canRegisterChildren: boolean;
  canRecordImmunizations: boolean;
  canViewAllPatients: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  };
  _count: {
    immunizationsGiven: number;
  };
}

export default function HealthWorkersPage() {
  const [workers, setWorkers] = useState<HealthWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<HealthWorker | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    staffId: "",
    specialization: "",
    canRegisterMothers: true,
    canRegisterChildren: true,
    canRecordImmunizations: true,
    canViewAllPatients: false,
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital-admin/health-workers");
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (error) {
      console.error("Error fetching health workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/health-workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setAddDialogOpen(false);
        resetForm();
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error adding health worker:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedWorker) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospital-admin/health-workers/${selectedWorker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          staffId: formData.staffId,
          specialization: formData.specialization,
          canRegisterMothers: formData.canRegisterMothers,
          canRegisterChildren: formData.canRegisterChildren,
          canRecordImmunizations: formData.canRecordImmunizations,
          canViewAllPatients: formData.canViewAllPatients,
        }),
      });
      if (res.ok) {
        setEditDialogOpen(false);
        resetForm();
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error updating health worker:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (worker: HealthWorker) => {
    try {
      const res = await fetch(`/api/hospital-admin/health-workers/${worker.id}/toggle`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error toggling worker:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorker) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospital-admin/health-workers/${selectedWorker.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setSelectedWorker(null);
        fetchWorkers();
      }
    } catch (error) {
      console.error("Error deleting health worker:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (worker: HealthWorker) => {
    setSelectedWorker(worker);
    setFormData({
      name: worker.user.name,
      email: worker.user.email,
      phone: worker.user.phone || "",
      password: "",
      staffId: worker.staffId || "",
      specialization: worker.specialization || "",
      canRegisterMothers: worker.canRegisterMothers,
      canRegisterChildren: worker.canRegisterChildren,
      canRecordImmunizations: worker.canRecordImmunizations,
      canViewAllPatients: worker.canViewAllPatients,
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      staffId: "",
      specialization: "",
      canRegisterMothers: true,
      canRegisterChildren: true,
      canRecordImmunizations: true,
      canViewAllPatients: false,
    });
    setSelectedWorker(null);
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.staffId && w.staffId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Workers</h1>
          <p className="text-gray-600">Manage your hospital&apos;s health care staff</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Health Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Health Worker</DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new health worker account
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dr. Sarah Nambi"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., sarah@hospital.ug"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+256 7XX XXX XXX"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Staff ID</Label>
                <Input
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  placeholder="e.g., HW-001"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Nurse, Midwife"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="col-span-2 space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Permissions</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Register Mothers</p>
                      <p className="text-sm text-gray-500">Can register new mothers</p>
                    </div>
                    <Switch
                      checked={formData.canRegisterMothers}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, canRegisterMothers: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Register Children</p>
                      <p className="text-sm text-gray-500">Can register new children</p>
                    </div>
                    <Switch
                      checked={formData.canRegisterChildren}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, canRegisterChildren: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Record Immunizations</p>
                      <p className="text-sm text-gray-500">Can record vaccine doses</p>
                    </div>
                    <Switch
                      checked={formData.canRecordImmunizations}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, canRecordImmunizations: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">View All Patients</p>
                      <p className="text-sm text-gray-500">Can see all patient records</p>
                    </div>
                    <Switch
                      checked={formData.canViewAllPatients}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, canViewAllPatients: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={saving || !formData.name || !formData.email || !formData.password}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Health Worker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or staff ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Health Workers Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-gray-900">Health Workers ({filteredWorkers.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No health workers found</p>
              <p className="text-sm text-gray-400">
                {workers.length === 0
                  ? "Add health workers to get started"
                  : "Try adjusting your search"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Staff ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Specialization</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Permissions</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Immunizations</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{worker.user.name}</div>
                        <div className="text-sm text-gray-500">{worker.user.email}</div>
                        {worker.user.phone && (
                          <div className="text-xs text-gray-400">{worker.user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {worker.staffId || "—"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {worker.specialization || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {worker.canRegisterMothers && (
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                            Mothers
                          </Badge>
                        )}
                        {worker.canRegisterChildren && (
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                            Children
                          </Badge>
                        )}
                        {worker.canRecordImmunizations && (
                          <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                            Immunizations
                          </Badge>
                        )}
                        {worker.canViewAllPatients && (
                          <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                            All Patients
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {worker._count.immunizationsGiven}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={worker.user.isActive ? "default" : "secondary"}
                        className={worker.user.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                        }
                      >
                        {worker.user.isActive ? "Active" : "Inactive"}
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
                            onClick={() => openEditDialog(worker)}
                            className="text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(worker)}
                            className={worker.user.isActive
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-green-600 hover:bg-green-50"
                            }
                          >
                            {worker.user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedWorker(worker);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
            <DialogTitle className="text-gray-900">Edit Health Worker</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update health worker details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Email</Label>
              <Input
                value={formData.email}
                disabled
                className="bg-gray-100 border-gray-300 text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Staff ID</Label>
              <Input
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-700">Specialization</Label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Permissions</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Register Mothers</p>
                    <p className="text-sm text-gray-500">Can register new mothers</p>
                  </div>
                  <Switch
                    checked={formData.canRegisterMothers}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canRegisterMothers: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Register Children</p>
                    <p className="text-sm text-gray-500">Can register new children</p>
                  </div>
                  <Switch
                    checked={formData.canRegisterChildren}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canRegisterChildren: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Record Immunizations</p>
                    <p className="text-sm text-gray-500">Can record vaccine doses</p>
                  </div>
                  <Switch
                    checked={formData.canRecordImmunizations}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canRecordImmunizations: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">View All Patients</p>
                    <p className="text-sm text-gray-500">Can see all patient records</p>
                  </div>
                  <Switch
                    checked={formData.canViewAllPatients}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, canViewAllPatients: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={saving || !formData.name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Delete Health Worker</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete {selectedWorker?.user.name}? This action cannot be undone.
              All their records and immunization history will be preserved but unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
