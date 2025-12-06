"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  AlertTriangle,
  Settings as SettingsIcon,
  Loader2,
  Save,
  Building,
} from "lucide-react";

interface HospitalSettings {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  overdueThreshold: number;
  alertsEnabled: boolean;
}

interface NotificationSettings {
  id: string;
  frequency: string;
  escalationDays: number[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  reminderDaysBefore: number;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
}

export default function SettingsPage() {
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hospital");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [hospitalRes, notificationRes] = await Promise.all([
        fetch("/api/hospital-admin/settings/hospital"),
        fetch("/api/hospital-admin/settings/notifications"),
      ]);

      if (hospitalRes.ok) {
        const data = await hospitalRes.json();
        setHospitalSettings(data);
      }

      if (notificationRes.ok) {
        const data = await notificationRes.json();
        setNotificationSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHospitalSettings = async () => {
    if (!hospitalSettings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/settings/hospital", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setHospitalSettings(data);
      }
    } catch (error) {
      console.error("Error saving hospital settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!notificationSettings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/hospital-admin/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationSettings(data);
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your hospital and notification preferences</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger
            value="hospital"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Building className="h-4 w-4 mr-2" />
            Hospital
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alert Thresholds
          </TabsTrigger>
        </TabsList>

        {/* Hospital Settings */}
        <TabsContent value="hospital">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Hospital Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Update your hospital&apos;s contact information and details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {hospitalSettings && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Hospital Name</Label>
                      <Input
                        value={hospitalSettings.name}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, name: e.target.value })
                        }
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">URL Slug</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={hospitalSettings.slug}
                          disabled
                          className="bg-gray-100 border-gray-300 text-gray-500"
                        />
                        <span className="text-sm text-gray-500">.marv.ug</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Phone</Label>
                      <Input
                        value={hospitalSettings.phone || ""}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, phone: e.target.value })
                        }
                        placeholder="+256 XXX XXX XXX"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Email</Label>
                      <Input
                        value={hospitalSettings.email || ""}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, email: e.target.value })
                        }
                        type="email"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-gray-700">Address</Label>
                      <Input
                        value={hospitalSettings.address || ""}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, address: e.target.value })
                        }
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">City</Label>
                      <Input
                        value={hospitalSettings.city || ""}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, city: e.target.value })
                        }
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">District</Label>
                      <Input
                        value={hospitalSettings.state || ""}
                        onChange={(e) =>
                          setHospitalSettings({ ...hospitalSettings, state: e.target.value })
                        }
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={saveHospitalSettings}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* Channels */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notification Channels
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enable or disable notification delivery methods
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {notificationSettings && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">Send email notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.emailEnabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">SMS</p>
                          <p className="text-sm text-gray-500">Send SMS notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.smsEnabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, smsEnabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Push</p>
                          <p className="text-sm text-gray-500">Send push notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.pushEnabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, pushEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timing */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Notification Timing
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configure when and how often notifications are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {notificationSettings && (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Reminder Days Before</Label>
                        <Input
                          type="number"
                          min="1"
                          max="14"
                          value={notificationSettings.reminderDaysBefore}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              reminderDaysBefore: parseInt(e.target.value) || 3,
                            })
                          }
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        <p className="text-sm text-gray-500">Days before scheduled date to send reminder</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Notification Frequency</Label>
                        <Select
                          value={notificationSettings.frequency}
                          onValueChange={(value) =>
                            setNotificationSettings({ ...notificationSettings, frequency: value })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="SINGLE" className="text-gray-900">
                              Single - One notification only
                            </SelectItem>
                            <SelectItem value="DAILY" className="text-gray-900">
                              Daily - Repeat daily until action
                            </SelectItem>
                            <SelectItem value="ESCALATING" className="text-gray-900">
                              Escalating - Increasing urgency
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Quiet Hours</p>
                          <p className="text-sm text-gray-500">
                            Don&apos;t send notifications during these hours
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Start Time</Label>
                          <Select
                            value={notificationSettings.quietHoursStart?.toString() || ""}
                            onValueChange={(value) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                quietHoursStart: value ? parseInt(value) : null,
                              })
                            }
                          >
                            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                              <SelectValue placeholder="Not set" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 max-h-60">
                              <SelectItem value="" className="text-gray-500">Not set</SelectItem>
                              {hours.map((hour) => (
                                <SelectItem key={hour} value={hour.toString()} className="text-gray-900">
                                  {hour.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">End Time</Label>
                          <Select
                            value={notificationSettings.quietHoursEnd?.toString() || ""}
                            onValueChange={(value) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                quietHoursEnd: value ? parseInt(value) : null,
                              })
                            }
                          >
                            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                              <SelectValue placeholder="Not set" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200 max-h-60">
                              <SelectItem value="" className="text-gray-500">Not set</SelectItem>
                              {hours.map((hour) => (
                                <SelectItem key={hour} value={hour.toString()} className="text-gray-900">
                                  {hour.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={saveNotificationSettings}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alert Thresholds */}
        <TabsContent value="alerts">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Performance Alert Thresholds
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure when performance alerts are triggered
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {hospitalSettings && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Overdue Threshold (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={hospitalSettings.overdueThreshold}
                        onChange={(e) =>
                          setHospitalSettings({
                            ...hospitalSettings,
                            overdueThreshold: parseInt(e.target.value) || 20,
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900"
                      />
                      <p className="text-sm text-gray-500">
                        Trigger alert when overdue rate exceeds this percentage
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700">Enable Alerts</Label>
                        <Switch
                          checked={hospitalSettings.alertsEnabled}
                          onCheckedChange={(checked) =>
                            setHospitalSettings({ ...hospitalSettings, alertsEnabled: checked })
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive performance alerts for this hospital
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Current Setting</p>
                        <p className="text-sm text-amber-700">
                          An alert will be triggered when more than {hospitalSettings.overdueThreshold}% of scheduled
                          immunizations are overdue.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={saveHospitalSettings}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
