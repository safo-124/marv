"use client";

import { useState, useEffect } from "react";
import {
  Baby,
  Search,
  Plus,
  Calendar,
  User,
  Phone,
  Loader2,
  ChevronRight,
  Syringe,
  Heart,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Mother {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  lastDeliveryDate?: string | null;
  createdAt?: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mother: Mother;
  _count?: {
    immunizationRecords: number;
  };
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    motherId: "",
  });

  useEffect(() => {
    fetchChildren();
    fetchMothers();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/hospital-admin/children");
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMothers = async () => {
    try {
      const response = await fetch("/api/hospital-admin/mothers");
      if (response.ok) {
        const data = await response.json();
        setMothers(data);
      }
    } catch (error) {
      console.error("Error fetching mothers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hospital-admin/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          motherId: "",
        });
        fetchChildren();
      }
    } catch (error) {
      console.error("Error creating child:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredChildren = children.filter((child) => {
    const matchesSearch =
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${child.mother.firstName} ${child.mother.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesGender = genderFilter === "all" || child.gender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    
    if (months < 1) {
      const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    } else if (months < 24) {
      return `${months} months`;
    } else {
      const years = Math.floor(months / 12);
      return `${years} years`;
    }
  };

  const stats = {
    total: children.length,
    male: children.filter((c) => c.gender === "MALE").length,
    female: children.filter((c) => c.gender === "FEMALE").length,
    totalImmunizations: children.reduce((sum, c) => sum + (c._count?.immunizationRecords || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Children Registry
            </h1>
          </div>
          <p className="text-slate-600 ml-14">
            Manage registered children and track their immunization journey
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 border-0 h-11 px-6">
              <Plus className="h-5 w-5 mr-2" />
              Register Child
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700/50 shadow-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Baby className="h-5 w-5 text-violet-400" />
                Register New Child
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new child to the immunization registry
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Enter first name"
                    className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-violet-500 focus:ring-violet-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Enter last name"
                    className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-violet-500 focus:ring-violet-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="bg-slate-800/50 border-slate-700 text-white h-11 focus:border-violet-500 focus:ring-violet-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-medium">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-11">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="MALE">👦 Male</SelectItem>
                      <SelectItem value="FEMALE">👧 Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">Mother</Label>
                <Select
                  value={formData.motherId}
                  onValueChange={(value) => {
                    const selectedMother = mothers.find((m) => m.id === value);
                    let dateOfBirth = formData.dateOfBirth;
                    
                    // If mother has a last delivery date, use it as default
                    if (selectedMother?.lastDeliveryDate) {
                      dateOfBirth = new Date(selectedMother.lastDeliveryDate)
                        .toISOString()
                        .split("T")[0];
                    } else if (selectedMother?.createdAt && !formData.dateOfBirth) {
                      // If no delivery date but mother was recently registered, use today
                      const registeredDate = new Date(selectedMother.createdAt);
                      const daysSinceRegistration = Math.floor(
                        (Date.now() - registeredDate.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      // If registered within last 7 days, suggest today's date
                      if (daysSinceRegistration <= 7) {
                        dateOfBirth = new Date().toISOString().split("T")[0];
                      }
                    }
                    
                    // Also set last name from mother if not already set
                    const lastName = formData.lastName || selectedMother?.lastName || "";
                    
                    setFormData({ 
                      ...formData, 
                      motherId: value,
                      dateOfBirth,
                      lastName,
                    });
                  }}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-11">
                    <SelectValue placeholder="Select mother" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                    {mothers.map((mother) => (
                      <SelectItem key={mother.id} value={mother.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-pink-400" />
                          {mother.firstName} {mother.lastName}
                          <span className="text-slate-500">• {mother.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.motherId && mothers.find((m) => m.id === formData.motherId)?.lastDeliveryDate && (
                  <p className="text-xs text-emerald-400 mt-1">
                    📅 Last delivery date auto-filled from mother&apos;s records
                  </p>
                )}
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Child
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Children</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">Registered in system</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/20">
              <Baby className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Boys</p>
              <p className="text-3xl font-bold text-white">{stats.male}</p>
              <p className="text-xs text-blue-400 mt-1">
                {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20">
              <span className="text-2xl">👦</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-pink-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Girls</p>
              <p className="text-3xl font-bold text-white">{stats.female}</p>
              <p className="text-xs text-pink-400 mt-1">
                {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-500/20">
              <span className="text-2xl">👧</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Immunizations</p>
              <p className="text-3xl font-bold text-white">{stats.totalImmunizations}</p>
              <p className="text-xs text-emerald-400 mt-1">Vaccines administered</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/20">
              <Syringe className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by child name or mother name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 rounded-xl"
          />
        </div>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-full sm:w-44 h-12 bg-slate-800/50 border-slate-700/50 text-white rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="MALE">👦 Boys Only</SelectItem>
            <SelectItem value="FEMALE">👧 Girls Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Children List */}
      {filteredChildren.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
              <Baby className="h-10 w-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || genderFilter !== "all" ? "No children found" : "No children registered yet"}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || genderFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start building your immunization registry by registering your first child"}
            </p>
            {!searchTerm && genderFilter === "all" && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register First Child
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10"
            >
              {/* Card Header with Gradient */}
              <div className={`h-2 ${child.gender === "MALE" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-pink-500 to-rose-500"}`} />
              
              <div className="p-5">
                {/* Child Info Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        child.gender === "MALE"
                          ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20"
                          : "bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20"
                      }`}
                    >
                      <span className="text-2xl">{child.gender === "MALE" ? "👦" : "👧"}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white group-hover:text-violet-200 transition-colors">
                        {child.firstName} {child.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{calculateAge(child.dateOfBirth)} old</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs font-medium ${
                      child.gender === "MALE"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-pink-500/20 text-pink-300 border-pink-500/30"
                    }`}
                  >
                    {child.gender === "MALE" ? "Boy" : "Girl"}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date of Birth</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(child.dateOfBirth).toLocaleDateString("en-UG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <Heart className="h-4 w-4 text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">Mother</p>
                      <p className="text-sm text-white font-medium truncate">
                        {child.mother.firstName} {child.mother.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Phone className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contact</p>
                      <p className="text-sm text-white font-medium">{child.mother.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Syringe className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">
                      {child._count?.immunizationRecords || 0} vaccines
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-slate-700/50 hover:bg-violet-600/20 text-slate-300 hover:text-violet-300 border border-slate-600/50 hover:border-violet-500/30"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
