"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRightLeft,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Baby,
  Building2,
  Search,
  Calendar,
  FileText,
} from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  slug: string;
  city: string | null;
}

interface TransferRequest {
  id: string;
  type: "INCOMING" | "OUTGOING";
  status: string;
  reason: string;
  notes: string | null;
  requestedAt: string;
  respondedAt: string | null;
  completedAt: string | null;
  mother?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  child?: {
    id: string;
    fullName: string;
    dateOfBirth: string;
  } | null;
  fromHospital: Hospital;
  toHospital: Hospital;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface Mother {
  id: string;
  fullName: string;
  phone: string;
  _count: {
    children: number;
  };
}

interface Child {
  id: string;
  fullName: string;
  dateOfBirth: string;
  mother: {
    fullName: string;
  };
}

export default function TransfersPage() {
  const [incomingRequests, setIncomingRequests] = useState<TransferRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<TransferRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondingTo, setRespondingTo] = useState<TransferRequest | null>(null);
  const [responseType, setResponseType] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();

  // New transfer form state
  const [transferType, setTransferType] = useState<"MOTHER" | "CHILD">("MOTHER");
  const [selectedMotherId, setSelectedMotherId] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transfersRes, hospitalsRes, mothersRes, childrenRes] = await Promise.all([
        fetch("/api/hospital-admin/transfers"),
        fetch("/api/hospital-admin/transfers/hospitals"),
        fetch("/api/hospital-admin/mothers?limit=100"),
        fetch("/api/hospital-admin/children?limit=100"),
      ]);

      if (transfersRes.ok) {
        const transfers = await transfersRes.json();
        setIncomingRequests(transfers.filter((t: TransferRequest) => t.type === "INCOMING"));
        setOutgoingRequests(transfers.filter((t: TransferRequest) => t.type === "OUTGOING"));
      }
      if (hospitalsRes.ok) {
        const data = await hospitalsRes.json();
        setHospitals(data);
      }
      if (mothersRes.ok) {
        const data = await mothersRes.json();
        setMothers(data.mothers || []);
      }
      if (childrenRes.ok) {
        const data = await childrenRes.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transfer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async () => {
    if (!selectedHospitalId || !transferReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (transferType === "MOTHER" && !selectedMotherId) {
      toast({
        title: "Error",
        description: "Please select a mother to transfer",
        variant: "destructive",
      });
      return;
    }

    if (transferType === "CHILD" && !selectedChildId) {
      toast({
        title: "Error",
        description: "Please select a child to transfer",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/hospital-admin/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motherId: transferType === "MOTHER" ? selectedMotherId : null,
          childId: transferType === "CHILD" ? selectedChildId : null,
          toHospitalId: selectedHospitalId,
          reason: transferReason,
          notes: transferNotes || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create transfer request");

      toast({
        title: "Success",
        description: "Transfer request submitted successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transfer request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async () => {
    if (!respondingTo || !responseType) return;

    if (responseType === "reject" && !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/hospital-admin/transfers/${respondingTo.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: responseType,
          rejectionReason: responseType === "reject" ? rejectionReason : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to respond to transfer");

      toast({
        title: "Success",
        description: responseType === "approve" 
          ? "Transfer request approved" 
          : "Transfer request rejected",
      });

      setRespondingTo(null);
      setResponseType(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to respond to transfer request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTransferType("MOTHER");
    setSelectedMotherId("");
    setSelectedChildId("");
    setSelectedHospitalId("");
    setTransferReason("");
    setTransferNotes("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const filteredMothers = mothers.filter((m) =>
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const filteredChildren = children.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTransferTable = (requests: TransferRequest[], type: "incoming" | "outgoing") => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          {type === "incoming" ? (
            <ArrowLeft className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          ) : (
            <ArrowRight className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900">
            No {type} transfer requests
          </h3>
          <p className="text-gray-600">
            {type === "incoming"
              ? "Other hospitals have not requested any patient transfers to you"
              : "You have not requested any patient transfers yet"}
          </p>
          {type === "outgoing" && (
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Transfer Request
            </Button>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>{type === "incoming" ? "From Hospital" : "To Hospital"}</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {request.mother ? (
                    <>
                      <User className="w-4 h-4 text-pink-600" />
                      <div>
                        <p className="font-medium">{request.mother.fullName}</p>
                        <p className="text-xs text-gray-500">{request.mother.phone}</p>
                      </div>
                    </>
                  ) : request.child ? (
                    <>
                      <Baby className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{request.child.fullName}</p>
                        <p className="text-xs text-gray-500">
                          DOB: {new Date(request.child.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">Unknown</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {type === "incoming" ? request.fromHospital.name : request.toHospital.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type === "incoming" ? request.fromHospital.city : request.toHospital.city}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="max-w-[200px] truncate" title={request.reason}>
                  {request.reason}
                </p>
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  {formatDate(request.requestedAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {type === "incoming" && request.status === "PENDING" && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => {
                        setRespondingTo(request);
                        setResponseType("approve");
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        setRespondingTo(request);
                        setResponseType("reject");
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {type === "outgoing" && request.status === "PENDING" && (
                  <Button variant="outline" size="sm" className="text-gray-600">
                    Cancel
                  </Button>
                )}
                {request.notes && (
                  <Button variant="ghost" size="sm" className="ml-2">
                    <FileText className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Requests</h1>
          <p className="text-gray-600">Manage patient transfers between hospitals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Transfer Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Patient Transfer</DialogTitle>
              <DialogDescription>
                Transfer a mother or child to another hospital
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={transferType === "MOTHER" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setTransferType("MOTHER");
                      setSelectedChildId("");
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mother
                  </Button>
                  <Button
                    type="button"
                    variant={transferType === "CHILD" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => {
                      setTransferType("CHILD");
                      setSelectedMotherId("");
                    }}
                  >
                    <Baby className="w-4 h-4 mr-2" />
                    Child
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Search {transferType === "MOTHER" ? "Mother" : "Child"}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${transferType.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {transferType === "MOTHER" && (
                <div className="space-y-2">
                  <Label>Select Mother</Label>
                  <Select value={selectedMotherId} onValueChange={setSelectedMotherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mother" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMothers.map((mother) => (
                        <SelectItem key={mother.id} value={mother.id}>
                          <div className="flex items-center gap-2">
                            <span>{mother.fullName}</span>
                            <span className="text-xs text-gray-500">({mother.phone})</span>
                            <Badge variant="outline" className="text-xs">
                              {mother._count.children} children
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {transferType === "CHILD" && (
                <div className="space-y-2">
                  <Label>Select Child</Label>
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          <div className="flex flex-col">
                            <span>{child.fullName}</span>
                            <span className="text-xs text-gray-500">
                              Mother: {child.mother.fullName} | DOB: {new Date(child.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Destination Hospital</Label>
                <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{hospital.name}</span>
                          {hospital.city && (
                            <span className="text-xs text-gray-500">({hospital.city})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason for Transfer *</Label>
                <Textarea
                  placeholder="Enter the reason for this transfer request..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any additional information..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTransfer} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pending Incoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {incomingRequests.filter((r) => r.status === "PENDING").length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Pending Outgoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">
                {outgoingRequests.filter((r) => r.status === "PENDING").length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">
                {[...incomingRequests, ...outgoingRequests].filter(
                  (r) => r.status === "COMPLETED" &&
                  new Date(r.completedAt || "").getMonth() === new Date().getMonth()
                ).length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {incomingRequests.length + outgoingRequests.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Requests Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Requests</CardTitle>
          <CardDescription>View and manage incoming and outgoing transfer requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Tabs defaultValue="incoming">
              <TabsList>
                <TabsTrigger value="incoming" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Incoming
                  {incomingRequests.filter((r) => r.status === "PENDING").length > 0 && (
                    <Badge className="ml-1">
                      {incomingRequests.filter((r) => r.status === "PENDING").length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Outgoing
                </TabsTrigger>
              </TabsList>
              <TabsContent value="incoming" className="mt-4">
                {renderTransferTable(incomingRequests, "incoming")}
              </TabsContent>
              <TabsContent value="outgoing" className="mt-4">
                {renderTransferTable(outgoingRequests, "outgoing")}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <AlertDialog 
        open={responseType === "approve" && !!respondingTo} 
        onOpenChange={() => {
          setRespondingTo(null);
          setResponseType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Transfer Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the transfer of{" "}
              <strong>
                {respondingTo?.mother?.fullName || respondingTo?.child?.fullName}
              </strong>{" "}
              from <strong>{respondingTo?.fromHospital.name}</strong> to your hospital.
              The patient&apos;s records will be transferred to your hospital.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRespond} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Approve Transfer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Dialog */}
      <Dialog 
        open={responseType === "reject" && !!respondingTo} 
        onOpenChange={() => {
          setRespondingTo(null);
          setResponseType(null);
          setRejectionReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transfer request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Rejection Reason *</Label>
            <Textarea
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRespondingTo(null);
                setResponseType(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRespond} 
              disabled={isSubmitting || !rejectionReason}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Transfer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
