import { useState } from "react";
import { User, Bell, Shield, Palette, Database, LogOut, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Settings() {
  const { profile, user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email: email,
          phone: phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="page-container">
      <section className="page-heading">
        <div>
          <div className="eyebrow">Configuration</div>
          <h1>Settings</h1>
          <p>Manage your profile, preferences, and workspace configuration.</p>
        </div>
      </section>

      <div className="settings-grid">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile"><User size={16} className="mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="notifications"><Bell size={16} className="mr-2" /> Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield size={16} className="mr-2" /> Security</TabsTrigger>
            <TabsTrigger value="appearance"><Palette size={16} className="mr-2" /> Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt="Profile" />
                    <AvatarFallback>{fullName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      placeholder="https://example.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="mt-2 max-w-md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Enter a direct image URL or leave empty for initials</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2"
                      disabled
                    />
                    <p className="text-sm text-muted-foreground mt-1">Email changes require re-authentication</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+92 3XX XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving} className="primary-btn">
                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch checked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when transactions are added</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Reminders for due payments and fees</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Summary</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly financial summary</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="font-medium mb-2">Change Password</p>
                  <p className="text-sm text-muted-foreground mb-4">Update your password to keep your account secure</p>
                  <Button variant="outline" onClick={() => toast.info("Password change would redirect to auth provider")}>
                    Change Password
                  </Button>
                </div>
                <div>
                  <p className="font-medium mb-2">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                  <Button variant="outline" onClick={() => toast.info("2FA setup would be handled by auth provider")}>
                    Enable 2FA
                  </Button>
                </div>
                <div>
                  <p className="font-medium mb-2">Active Sessions</p>
                  <p className="text-sm text-muted-foreground mb-4">View and manage your active login sessions</p>
                  <Button variant="outline" onClick={() => toast.info("Session management would be handled by auth provider")}>
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how FinTrack looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="font-medium mb-2">Theme</p>
                  <Select value="light" onValueChange={() => {}}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="font-medium mb-2">Language</p>
                  <Select value="en" onValueChange={() => {}}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="font-medium mb-2">Currency</p>
                  <Select value="PKR" onValueChange={() => {}}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR (₨)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" onClick={() => toast.error("Account deletion is not implemented in demo")}>
                <LogOut size={16} /> Delete Account
              </Button>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <p className="font-medium">Log Out</p>
                <p className="text-sm text-muted-foreground">Sign out of your current session</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut size={16} /> Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}