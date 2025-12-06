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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Baby,
  Plus,
  Search,
  Loader2,
  ChevronRight,
  Phone,
  Calendar,
  MapPin,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Mother {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bloodGroup: string | null;
  registrationType: string;
  createdAt: string;
  _count: {
    children: number;
  };
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  birthWeight: number | null;
  bloodGroup: string | null;
  createdAt: string;
  mother: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  _count: {
    immunizationRecords: number;
    immunizationSchedules: number;
  };
}

// Uganda Districts for state field
const UGANDA_DISTRICTS = [
  "Kampala", "Wakiso", "Mukono", "Jinja", "Mbarara", "Gulu", "Lira", "Masaka",
  "Mbale", "Kabale", "Fort Portal", "Arua", "Soroti", "Entebbe", "Tororo", "Kasese",
  "Iganga", "Hoima", "Masindi", "Moroto", "Kitgum", "Nebbi", "Busia", "Kumi",
  "Pallisa", "Kayunga", "Mityana", "Mubende", "Sembabule", "Rakai", "Lyantonde",
  "Ntungamo", "Bushenyi", "Rukungiri", "Kanungu", "Kisoro", "Bundibugyo", "Kabarole",
  "Kyenjojo", "Kamwenge", "Kibaale", "Buliisa", "Kiryandongo", "Nwoya", "Amuru",
  "Adjumani", "Moyo", "Yumbe", "Koboko", "Maracha", "Zombo", "Pader", "Agago",
  "Lamwo", "Otuke", "Alebtong", "Dokolo", "Amolatar", "Apac", "Oyam", "Kole",
  "Kaberamaido", "Katakwi", "Amuria", "Bukedea", "Serere", "Ngora", "Kapchorwa",
  "Bukwo", "Kween", "Bulambuli", "Sironko", "Manafwa", "Bududa", "Namisindwa",
  "Budaka", "Namutumba", "Kaliro", "Luuka", "Buyende", "Kamuli", "Bugiri", "Namayingo",
  "Bugweri", "Mayuge", "Buikwe", "Mpigi", "Butambala", "Gomba", "Lwengo", "Kalangala",
  "Kalungu", "Bukomansimbi", "Ssembabule", "Kyotera", "Rubirizi", "Sheema", "Mitooma",
  "Buhweju", "Isingiro", "Kiruhura", "Ibanda", "Kagadi", "Kakumiro", "Rubanda",
  "Rukiga", "Kazo", "Rwampara", "Bunyangabu", "Kikuube", "Kwania", "Kaabong",
  "Kapelebyong", "Kalaki", "Kassanda", "Kyegegwa", "Obongi", "Madi-Okollo", "Terego"
].sort();

export default function MothersChildrenPage() {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("mothers");
  const [addMotherDialogOpen, setAddMotherDialogOpen] = useState(false);
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [motherFormData, setMotherFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    bloodGroup: "",
    genotype: "",
    allergies: "",
    registrationType: "DELIVERY" as "DELIVERY" | "TRANSFER" | "WALK_IN",
  });
  const [childFormData, setChildFormData] = useState({
    motherId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE",
    birthWeight: "",
    bloodGroup: "",
    genotype: "",
    allergies: "",
  });

  useEffect(() => {
    if (activeTab === "mothers") {
      fetchMothers();
    } else {
      fetchChildren();
    }
  }, [activeTab]);

  const fetchMothers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital-admin/mothers");
      if (res.ok) {
        const data = await res.json();
        setMothers(data);
      }
    } catch (error) {
      console.error("Error fetching mothers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hospital-admin/children");
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMother = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/mothers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(motherFormData),
      });
      if (res.ok) {
        setAddMotherDialogOpen(false);
        resetMotherForm();
        fetchMothers();
      }
    } catch (error) {
      console.error("Error adding mother:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...childFormData,
          birthWeight: childFormData.birthWeight ? parseFloat(childFormData.birthWeight) : null,
        }),
      });
      if (res.ok) {
        setAddChildDialogOpen(false);
        resetChildForm();
        fetchChildren();
      }
    } catch (error) {
      console.error("Error adding child:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetMotherForm = () => {
    setMotherFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      alternatePhone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      bloodGroup: "",
      genotype: "",
      allergies: "",
      registrationType: "DELIVERY",
    });
  };

  const resetChildForm = () => {
    setChildFormData({
      motherId: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "MALE",
      birthWeight: "",
      bloodGroup: "",
      genotype: "",
      allergies: "",
    });
  };

  const getAgeFromDob = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const diffTime = today.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const filteredMothers = mothers.filter(
    (m) =>
      m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  const filteredChildren = children.filter(
    (c) =>
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mother.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mother.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const registrationTypeLabel = {
    DELIVERY: "Delivery",
    TRANSFER: "Transfer In",
    WALK_IN: "Walk-in",
  };

  const registrationTypeColor = {
    DELIVERY: "bg-green-100 text-green-800",
    TRANSFER: "bg-blue-100 text-blue-800",
    WALK_IN: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mothers & Children</h1>
          <p className="text-gray-600">Manage patient registrations and records</p>
        </div>
        <div className="flex gap-2">
          {/* Add Child Dialog */}
          <Dialog open={addChildDialogOpen} onOpenChange={(open) => { setAddChildDialogOpen(open); if (!open) resetChildForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Baby className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Register Child</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Register a new child to an existing mother
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700">Mother *</Label>
                  <Select
                    value={childFormData.motherId}
                    onValueChange={(value) => setChildFormData({ ...childFormData, motherId: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select mother" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {mothers.map((mother) => (
                        <SelectItem key={mother.id} value={mother.id} className="text-gray-900">
                          {mother.firstName} {mother.lastName} - {mother.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">First Name *</Label>
                  <Input
                    value={childFormData.firstName}
                    onChange={(e) => setChildFormData({ ...childFormData, firstName: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Last Name *</Label>
                  <Input
                    value={childFormData.lastName}
                    onChange={(e) => setChildFormData({ ...childFormData, lastName: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Date of Birth *</Label>
                  <Input
                    type="date"
                    value={childFormData.dateOfBirth}
                    onChange={(e) => setChildFormData({ ...childFormData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Gender *</Label>
                  <Select
                    value={childFormData.gender}
                    onValueChange={(value: "MALE" | "FEMALE") => setChildFormData({ ...childFormData, gender: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="MALE" className="text-gray-900">Male</SelectItem>
                      <SelectItem value="FEMALE" className="text-gray-900">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Birth Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={childFormData.birthWeight}
                    onChange={(e) => setChildFormData({ ...childFormData, birthWeight: e.target.value })}
                    placeholder="e.g., 3.2"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Blood Group</Label>
                  <Select
                    value={childFormData.bloodGroup}
                    onValueChange={(value) => setChildFormData({ ...childFormData, bloodGroup: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg} className="text-gray-900">{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Genotype</Label>
                  <Select
                    value={childFormData.genotype}
                    onValueChange={(value) => setChildFormData({ ...childFormData, genotype: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {["AA", "AS", "SS", "AC", "SC"].map((gt) => (
                        <SelectItem key={gt} value={gt} className="text-gray-900">{gt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700">Allergies</Label>
                  <Textarea
                    value={childFormData.allergies}
                    onChange={(e) => setChildFormData({ ...childFormData, allergies: e.target.value })}
                    placeholder="Known allergies..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddChildDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddChild}
                  disabled={saving || !childFormData.motherId || !childFormData.firstName || !childFormData.lastName || !childFormData.dateOfBirth}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Register Child
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Mother Dialog */}
          <Dialog open={addMotherDialogOpen} onOpenChange={(open) => { setAddMotherDialogOpen(open); if (!open) resetMotherForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Mother
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Register Mother</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Register a new mother to the hospital
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="col-span-3 space-y-2">
                  <Label className="text-gray-700">Registration Type *</Label>
                  <Select
                    value={motherFormData.registrationType}
                    onValueChange={(value: "DELIVERY" | "TRANSFER" | "WALK_IN") =>
                      setMotherFormData({ ...motherFormData, registrationType: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="DELIVERY" className="text-gray-900">Delivery - New birth at this hospital</SelectItem>
                      <SelectItem value="TRANSFER" className="text-gray-900">Transfer In - From another hospital</SelectItem>
                      <SelectItem value="WALK_IN" className="text-gray-900">Walk-in - First-time registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">First Name *</Label>
                  <Input
                    value={motherFormData.firstName}
                    onChange={(e) => setMotherFormData({ ...motherFormData, firstName: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Last Name *</Label>
                  <Input
                    value={motherFormData.lastName}
                    onChange={(e) => setMotherFormData({ ...motherFormData, lastName: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={motherFormData.dateOfBirth}
                    onChange={(e) => setMotherFormData({ ...motherFormData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Phone Number *</Label>
                  <Input
                    value={motherFormData.phone}
                    onChange={(e) => setMotherFormData({ ...motherFormData, phone: e.target.value })}
                    placeholder="+256 7XX XXX XXX"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Alternate Phone</Label>
                  <Input
                    value={motherFormData.alternatePhone}
                    onChange={(e) => setMotherFormData({ ...motherFormData, alternatePhone: e.target.value })}
                    placeholder="+256 7XX XXX XXX"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Email</Label>
                  <Input
                    type="email"
                    value={motherFormData.email}
                    onChange={(e) => setMotherFormData({ ...motherFormData, email: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700">Address</Label>
                  <Input
                    value={motherFormData.address}
                    onChange={(e) => setMotherFormData({ ...motherFormData, address: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">City/Town</Label>
                  <Input
                    value={motherFormData.city}
                    onChange={(e) => setMotherFormData({ ...motherFormData, city: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-gray-700">District</Label>
                  <Select
                    value={motherFormData.state}
                    onValueChange={(value) => setMotherFormData({ ...motherFormData, state: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-60">
                      {UGANDA_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district} className="text-gray-900">
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Blood Group</Label>
                  <Select
                    value={motherFormData.bloodGroup}
                    onValueChange={(value) => setMotherFormData({ ...motherFormData, bloodGroup: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg} className="text-gray-900">{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Genotype</Label>
                  <Select
                    value={motherFormData.genotype}
                    onValueChange={(value) => setMotherFormData({ ...motherFormData, genotype: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {["AA", "AS", "SS", "AC", "SC"].map((gt) => (
                        <SelectItem key={gt} value={gt} className="text-gray-900">{gt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Allergies</Label>
                  <Input
                    value={motherFormData.allergies}
                    onChange={(e) => setMotherFormData({ ...motherFormData, allergies: e.target.value })}
                    placeholder="Known allergies..."
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddMotherDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMother}
                  disabled={saving || !motherFormData.firstName || !motherFormData.lastName || !motherFormData.phone}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Register Mother
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger
            value="mothers"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Mothers ({mothers.length})
          </TabsTrigger>
          <TabsTrigger
            value="children"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Baby className="h-4 w-4 mr-2" />
            Children ({children.length})
          </TabsTrigger>
        </TabsList>

        {/* Mothers Tab */}
        <TabsContent value="mothers">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-900">Registered Mothers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredMothers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No mothers found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Contact</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Location</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Children</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Registered</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMothers.map((mother) => (
                      <TableRow key={mother.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {mother.firstName} {mother.lastName}
                          </div>
                          {mother.bloodGroup && (
                            <div className="text-xs text-gray-400">Blood: {mother.bloodGroup}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-700">
                            <Phone className="h-3 w-3" />
                            {mother.phone}
                          </div>
                          {mother.email && (
                            <div className="text-sm text-gray-500">{mother.email}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-3 w-3" />
                            {mother.city || mother.state || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={registrationTypeColor[mother.registrationType as keyof typeof registrationTypeColor]}>
                            {registrationTypeLabel[mother.registrationType as keyof typeof registrationTypeLabel]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {mother._count.children}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(mother.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/hospital-admin/mothers/${mother.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Children Tab */}
        <TabsContent value="children">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-900">Registered Children</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredChildren.length === 0 ? (
                <div className="text-center py-12">
                  <Baby className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No children found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-700 font-semibold">Child</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Mother</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Age</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Gender</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Immunizations</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Registered</TableHead>
                      <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChildren.map((child) => (
                      <TableRow key={child.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {child.firstName} {child.lastName}
                          </div>
                          {child.birthWeight && (
                            <div className="text-xs text-gray-400">Birth weight: {child.birthWeight} kg</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-700">
                            {child.mother.firstName} {child.mother.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{child.mother.phone}</div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {getAgeFromDob(child.dateOfBirth)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={child.gender === "MALE"
                              ? "border-blue-200 text-blue-700 bg-blue-50"
                              : "border-pink-200 text-pink-700 bg-pink-50"
                            }
                          >
                            {child.gender === "MALE" ? "Male" : "Female"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-700">
                            {child._count.immunizationRecords} / {child._count.immunizationSchedules}
                          </div>
                          <div className="text-xs text-gray-400">completed / scheduled</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Calendar className="h-3 w-3" />
                            {new Date(child.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/hospital-admin/children/${child.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
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
    </div>
  );
}
