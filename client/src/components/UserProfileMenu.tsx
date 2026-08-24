"use client";

import { useState, useRef, useEffect } from "react";
import { X, LogOut, User, Settings2, Bell, Shield, Palette, Database, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserProfileMenuProps {
  position?: "top-right" | "bottom-left";
  trigger?: React.ReactNode;
}

export function UserProfileMenu({ position = "top-right", trigger }: UserProfileMenuProps) {
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
    setOpen(false);
  };

  const fullName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarUrl = profile?.avatar_url;

  const menuItems = [
    { label: "Profile", icon: User, action: () => toast.info("Profile page coming soon") },
    { label: "Settings", icon: Settings2, action: () => toast.info("Settings page coming soon") },
    { label: "Notifications", icon: Bell, action: () => toast.info("Notifications coming soon") },
    { label: "Security", icon: Shield, action: () => toast.info("Security settings coming soon") },
    { label: "Appearance", icon: Palette, action: () => toast.info("Appearance settings coming soon") },
    { label: "Workspaces", icon: Database, action: () => toast.info("Workspace management coming soon") },
    { label: "Log out", icon: LogOut, action: handleSignOut, destructive: true },
  ];

  const DropdownContent = (
    <div
      ref={dropdownRef}
      className="profile-dropdown"
      style={{
        position: "absolute",
        top: position === "top-right" ? "100%" : "auto",
        bottom: position === "bottom-left" ? "100%" : "auto",
        right: position === "top-right" ? 0 : "auto",
        left: position === "bottom-left" ? 0 : "auto",
        marginTop: position === "top-right" ? "8px" : "0",
        marginBottom: position === "bottom-left" ? "8px" : "0",
        zIndex: 50,
        minWidth: 220,
        background: "#fff",
        border: "1px solid #e6edf5",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(20,42,73,.15)",
        padding: "8px",
        animation: "dropdownIn .16s cubic-bezier(.23,1,.32,1)",
      }}
    >
      <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid #edf1f5", marginBottom: "4px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#182b46" }}>{fullName}</div>
        <div style={{ fontSize: "11px", color: "#8b98aa", marginTop: "2px" }}>{user?.email || profile?.email || "No email"}</div>
      </div>
      {menuItems.map((item, index) => (
        <button
          key={item.label}
          onClick={item.action}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            borderRadius: "8px",
            color: item.destructive ? "#ef4444" : "#3a4e69",
            fontSize: "12px",
            fontWeight: 500,
            textAlign: "left",
            cursor: "pointer",
            transition: "background-color .12s ease, color .12s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = item.destructive ? "#fef2f2" : "#f2f6fc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <item.icon size={16} style={{ color: item.destructive ? "#ef4444" : "#8794a6" }} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  const defaultTrigger = (
    <button
      ref={triggerRef}
      onClick={() => setOpen(!open)}
      className="avatar-small"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        background: "#2f6bff",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
      }}
    >
      {avatarUrl ? (
        <Avatar>
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ) : (
        initials
      )}
    </button>
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {trigger || defaultTrigger}
      {open && DropdownContent}
    </div>
  );
}