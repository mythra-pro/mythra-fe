"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar } from "lucide-react";
import { UserRole } from "@/app/types/user";

interface RoleSidebarProps {
  role: UserRole;
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      href: `/dashboard/${role}`,
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      href: role === "customer" ? "/events" : `/dashboard/${role}/events`,
      icon: Calendar,
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
          Menu
        </h3>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
