"use client";

import { ReactNode, useState, useEffect } from "react";
import { Menu, X, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/app/types/user";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { CustomWalletButton } from "@/components/program/WalletButton";

export interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MenuItem[];
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

interface DashboardLayoutProps {
  children: ReactNode;
  user: User; // User is REQUIRED - no optional fallback
  menuSections?: MenuSection[];
  // Legacy support - will be deprecated
  sidebar?: ReactNode;
}

export function DashboardLayout({
  children,
  user,
  menuSections = [],
  sidebar, // Legacy support
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Extract current role from pathname
  const currentRole = pathname?.split("/")[2] || "organizer";

  // Wait for client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication (Web2 localStorage)
  useEffect(() => {
    if (!isMounted) return;

    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userEmail = localStorage.getItem("userEmail");

    // Redirect if not authenticated
    if (!isAuthenticated || !userEmail) {
      console.warn("Not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }

    // Optional: Check if user email matches
    if (user.email && user.email !== userEmail) {
      console.warn("User email mismatch, redirecting to login...");
      router.push("/login");
      return;
    }
  }, [isMounted, user.email, router]);

  // Don't render until mounted on client
  if (!isMounted) {
    return null;
  }

  const handleLogout = () => {
    // Clear authentication from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("userRole");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Image
                src="/favicon.svg"
                alt="Mythra Logo"
                width={30}
                height={30}
                className="h-8 w-8 rounded-lg bg-white"
              />
              <span className="text-xl font-bold text-gray-900">Mythra</span>
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events, tickets..."
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div> */}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Role Switcher - Only shows if user has multiple roles */}
            <RoleSwitcher
              currentRole={currentRole}
              className="hidden md:flex"
            />

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100 relative cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
            </Button>

            {/* Wallet Button - Shows user info & logout */}
            <CustomWalletButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {isSidebarOpen && (
          <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] shadow-sm">
            {menuSections.length > 0 ? (
              <DynamicSidebar menuSections={menuSections} />
            ) : (
              sidebar
            )}
          </aside>
        )}

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-16 z-40 w-64 bg-white h-[calc(100vh-4rem)] shadow-xl lg:hidden overflow-y-auto">
              {menuSections.length > 0 ? (
                <DynamicSidebar menuSections={menuSections} />
              ) : (
                sidebar
              )}
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// Dynamic Sidebar Component
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DynamicSidebarProps {
  menuSections: MenuSection[];
}

function DynamicSidebar({ menuSections }: DynamicSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="p-4 space-y-6">
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.title && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                {section.title}
              </h3>
            </div>
          )}

          <nav className="space-y-1">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <div key={itemIndex}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant={active ? "secondary" : "default"}
                        className={cn(
                          "text-xs",
                          active
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-blue-600 text-white"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>

                  {/* Sub-menu items */}
                  {item.children && active && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child, childIndex) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.href);

                        return (
                          <Link
                            key={childIndex}
                            href={child.href}
                            className={cn(
                              "flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors",
                              childActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <ChildIcon className="h-3 w-3" />
                              <span>{child.title}</span>
                            </div>
                            {child.badge && (
                              <Badge variant="outline" className="text-xs">
                                {child.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
