"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Settings2,
  Bell,
  Shield,
  Palette,
  Database,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface UserProfileMenuProps {
  position?: "top-right" | "bottom-left";
  trigger?: React.ReactNode;
}

export function UserProfileMenu({ position = "top-right", trigger }: UserProfileMenuProps) {
  const { profile, user, signOut, openAuthModal } = useAuth();
  const [, navigate] = useLocation();
  const themeContext = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.warn("Notice logging out:", error?.message || error);
      toast.error("Failed to log out");
    }
    setOpen(false);
  };

  // Reliable user info with proper fallbacks
  const fullName =
    profile?.full_name ||
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Tayyab Afridi");

  const email =
    user?.email ||
    profile?.email ||
    "itstayyabafridi@gmail.com";

  // Clean initials
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "TA";

  const avatarUrl = profile?.avatar_url;

  const navigateToTab = (tab: string) => {
    navigate(`/settings?tab=${tab}`);
    setOpen(false);
  };

  const handleToggleTheme = () => {
    if (themeContext.toggleTheme) {
      themeContext.toggleTheme();
      toast.success(`Theme switched to ${themeContext.theme === "light" ? "Dark" : "Light"}`);
    } else {
      toast.info("Theme: Clean Slate Light (Optimized for financial clarity)");
    }
    setOpen(false);
  };

  const menuSections = [
    {
      items: [
        {
          label: "Profile & Account",
          icon: User,
          badge: null,
          onClick: () => navigateToTab("profile"),
        },
        {
          label: "Workspace Settings",
          icon: Settings2,
          badge: null,
          onClick: () => navigateToTab("workspace"),
        },
        {
          label: "Backup & CSV Data",
          icon: Database,
          badge: "CSV",
          onClick: () => navigateToTab("backup"),
        },
      ],
    },
    {
      items: [
        {
          label: "Notifications",
          icon: Bell,
          badge: null,
          onClick: () => navigateToTab("notifications"),
        },
        {
          label: "Security & Access",
          icon: Shield,
          badge: null,
          onClick: () => navigateToTab("security"),
        },
        {
          label: "Appearance",
          icon: Palette,
          badge: themeContext.theme === "dark" ? "Dark" : "Light",
          onClick: handleToggleTheme,
        },
      ],
    },
    {
      items: [
        {
          label: user ? "Switch Account" : "Sign In / Register",
          icon: LogIn,
          badge: null,
          onClick: () => {
            setOpen(false);
            openAuthModal(user ? "signin" : "signin");
          },
        },
        ...(user
          ? [
              {
                label: "Log out",
                icon: LogOut,
                badge: null,
                destructive: true,
                onClick: handleSignOut,
              },
            ]
          : []),
      ],
    },
  ];

  // Dropdown card with absolute positioning and high z-index
  const DropdownContent = (
    <div
      ref={dropdownRef}
      className="profile-dropdown"
      style={{
        position: "absolute",
        top: position === "top-right" ? "calc(100% + 8px)" : "auto",
        bottom: position === "bottom-left" ? "calc(100% + 8px)" : "auto",
        right: position === "top-right" ? 0 : "auto",
        left: position === "bottom-left" ? 0 : "auto",
        width: position === "bottom-left" && trigger ? "100%" : 260,
        minWidth: 240,
        maxWidth: "calc(100vw - 24px)",
        background: "#ffffff",
        border: "1px solid #e5eaf2",
        borderRadius: "14px",
        boxShadow: "0 20px 48px -6px rgba(15, 23, 42, 0.2), 0 8px 20px -4px rgba(15, 23, 42, 0.08)",
        padding: "6px",
        zIndex: 1000,
        animation: "dropdownIn .16s cubic-bezier(.23,1,.32,1)",
      }}
    >
      {/* Header Profile Identity */}
      <div
        style={{
          padding: "10px 12px 10px",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
          borderRadius: "10px",
          border: "1px solid #eef2f6",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "8px",
            padding: "2px 8px",
            borderRadius: "6px",
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            fontSize: "10px",
            fontWeight: 600,
            color: "#1d4ed8",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "inline-block",
            }}
          />
          <span>Owner • Pro Workspace</span>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <div key={sIdx}>
          {sIdx > 0 && (
            <div
              style={{
                height: "1px",
                background: "#f1f5f9",
                margin: "4px 6px",
              }}
            />
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const isDestructive = (item as any).destructive;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  border: "none",
                  background: "transparent",
                  borderRadius: "8px",
                  color: isDestructive ? "#e11d48" : "#334155",
                  fontSize: "12px",
                  fontWeight: 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.12s ease, color 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDestructive ? "#fff1f2" : "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <Icon
                    size={15}
                    style={{
                      color: isDestructive ? "#e11d48" : "#64748b",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "#f1f5f9",
                      color: "#64748b",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  const defaultTrigger = (
    <button
      ref={triggerRef as any}
      onClick={() => setOpen(!open)}
      type="button"
      className="avatar-small flex items-center justify-center font-bold text-white transition-all cursor-pointer select-none"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2f6bff 0%, #1e4fd9 100%)",
        boxShadow: open
          ? "0 0 0 3px rgba(47,107,255,0.3)"
          : "0 2px 6px rgba(47,107,255,0.22)",
        border: "2px solid #ffffff",
      }}
      aria-label="User profile menu"
      aria-expanded={open}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: "11px", letterSpacing: "-0.02em" }}>{initials}</span>
      )}
    </button>
  );

  return (
    <div
      style={{
        position: "relative",
        display: trigger ? "block" : "inline-block",
        width: trigger ? "100%" : "auto",
        zIndex: open ? 100 : "auto",
      }}
    >
      {trigger ? (
        <div
          ref={triggerRef as any}
          onClick={() => setOpen(!open)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}
      {open && DropdownContent}
    </div>
  );
}