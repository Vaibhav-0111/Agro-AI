import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Wifi, 
  Palette,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: "John Farmer",
    email: "john@agrolens.com",
    phone: "+1 (555) 123-4567",
    location: "California, USA",
    bio: "Agricultural specialist with 15 years of experience in precision farming and crop management.",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weatherUpdates: true,
    cropHealthAlerts: true,
    systemMaintenance: false,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    theme: "system",
    language: "english",
    timezone: "UTC-8",
    units: "metric",
    autoRefresh: true,
    dataRetention: "1year",
  });

  // Sensor settings
  const [sensorSettings, setSensorSettings] = useState({
    updateFrequency: "5min",
    alertThresholds: true,
    autoCalibration: true,
    dataLogging: true,
  });

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System", icon: SettingsIcon },
    { id: "sensors", label: "Sensors", icon: Wifi },
    { id: "security", label: "Security", icon: Shield },
  ];

  const saveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const resetSettings = () => {
    toast.info("Settings reset to defaults");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and system configurations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {settingsTabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-[hsl(var(--agro-primary))] text-white shadow-md"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/api/placeholder/80/80" />
                        <AvatarFallback className="text-lg bg-[hsl(var(--agro-primary))] text-white">
                          JF
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <p className="text-muted-foreground">Agricultural Specialist</p>
                      <Badge className="mt-2 bg-[hsl(var(--agro-success))] text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email Alerts</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Receive important notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailAlerts}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, emailAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">SMS Alerts</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                      </div>
                      <Switch
                        checked={notifications.smsAlerts}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, smsAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Push Notifications</span>
                        <p className="text-sm text-muted-foreground">Browser push notifications for real-time updates</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, pushNotifications: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Weather Updates</span>
                        <p className="text-sm text-muted-foreground">Daily weather forecasts and severe weather alerts</p>
                      </div>
                      <Switch
                        checked={notifications.weatherUpdates}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, weatherUpdates: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Crop Health Alerts</span>
                        <p className="text-sm text-muted-foreground">Notifications about crop health issues</p>
                      </div>
                      <Switch
                        checked={notifications.cropHealthAlerts}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, cropHealthAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">System Maintenance</span>
                        <p className="text-sm text-muted-foreground">Updates about system maintenance and downtime</p>
                      </div>
                      <Switch
                        checked={notifications.systemMaintenance}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, systemMaintenance: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "system" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={systemSettings.theme} onValueChange={(value) => 
                        setSystemSettings({ ...systemSettings, theme: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={systemSettings.language} onValueChange={(value) => 
                        setSystemSettings({ ...systemSettings, language: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={systemSettings.timezone} onValueChange={(value) => 
                        setSystemSettings({ ...systemSettings, timezone: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                          <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                          <SelectItem value="UTC+0">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Units</Label>
                      <Select value={systemSettings.units} onValueChange={(value) => 
                        setSystemSettings({ ...systemSettings, units: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric</SelectItem>
                          <SelectItem value="imperial">Imperial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Auto Refresh Data</span>
                        <p className="text-sm text-muted-foreground">Automatically update sensor data and charts</p>
                      </div>
                      <Switch
                        checked={systemSettings.autoRefresh}
                        onCheckedChange={(checked) => 
                          setSystemSettings({ ...systemSettings, autoRefresh: checked })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Retention Period</Label>
                      <Select value={systemSettings.dataRetention} onValueChange={(value) => 
                        setSystemSettings({ ...systemSettings, dataRetention: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "sensors" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Sensor Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Update Frequency</Label>
                      <Select value={sensorSettings.updateFrequency} onValueChange={(value) => 
                        setSensorSettings({ ...sensorSettings, updateFrequency: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1min">Every 1 minute</SelectItem>
                          <SelectItem value="5min">Every 5 minutes</SelectItem>
                          <SelectItem value="15min">Every 15 minutes</SelectItem>
                          <SelectItem value="1hour">Every hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Alert Thresholds</span>
                        <p className="text-sm text-muted-foreground">Enable automatic alerts when sensor values exceed thresholds</p>
                      </div>
                      <Switch
                        checked={sensorSettings.alertThresholds}
                        onCheckedChange={(checked) => 
                          setSensorSettings({ ...sensorSettings, alertThresholds: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Auto Calibration</span>
                        <p className="text-sm text-muted-foreground">Automatically calibrate sensors weekly</p>
                      </div>
                      <Switch
                        checked={sensorSettings.autoCalibration}
                        onCheckedChange={(checked) => 
                          setSensorSettings({ ...sensorSettings, autoCalibration: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium">Data Logging</span>
                        <p className="text-sm text-muted-foreground">Store detailed sensor logs for analysis</p>
                      </div>
                      <Switch
                        checked={sensorSettings.dataLogging}
                        onCheckedChange={(checked) => 
                          setSensorSettings({ ...sensorSettings, dataLogging: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[hsl(var(--agro-success))]/10 border border-[hsl(var(--agro-success))]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--agro-success))]" />
                        <span className="font-medium text-[hsl(var(--agro-success))]">Security Status: Good</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Your account is secure with current settings.</p>
                    </div>

                    <div className="space-y-4">
                      <Button variant="outline" className="justify-start w-full">
                        Change Password
                      </Button>
                      <Button variant="outline" className="justify-start w-full">
                        Enable Two-Factor Authentication
                      </Button>
                      <Button variant="outline" className="justify-start w-full">
                        Download Security Report
                      </Button>
                      <Button variant="destructive" className="justify-start w-full">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Sign Out All Devices
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={saveSettings} className="bg-[hsl(var(--agro-primary))] hover:bg-[hsl(var(--agro-primary))]/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={resetSettings}>
                  Reset to Defaults
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;