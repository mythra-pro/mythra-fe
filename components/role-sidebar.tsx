"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  Wallet,
  Settings,
  TrendingUp,
  QrCode,
  FileText,
  DollarSign,
  Vote,
  Target,
  ShieldCheck,
  Database,
} from "lucide-react";
import { UserRole } from "@/app/types/user";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface RoleSidebarProps {
  role: UserRole;
}

export function RoleSidebar({ role }: RoleSidebarProps) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "organizer":
        return [
          {
            title: "Dashboard",
            href: "/dashboard/organizer",
            icon: LayoutDashboard,
          },
          {
            title: "My Events",
            href: "/dashboard/organizer/events",
            icon: Calendar,
          },
          {
            title: "Create Event",
            href: "/dashboard/organizer/create",
            icon: FileText,
          },
          {
            title: "Analytics",
            href: "/dashboard/organizer/analytics",
            icon: TrendingUp,
          },
          {
            title: "Staff Management",
            href: "/dashboard/organizer/staff",
            icon: Users,
          },
          {
            title: "Payouts",
            href: "/dashboard/organizer/payouts",
            icon: Wallet,
          },
          {
            title: "Campaigns",
            href: "/dashboard/organizer/campaigns",
            icon: Target,
          },
          {
            title: "Settings",
            href: "/dashboard/organizer/settings",
            icon: Settings,
          },
        ];
      case "staff":
        return [
          {
            title: "Dashboard",
            href: "/dashboard/staff",
            icon: LayoutDashboard,
          },
          { title: "Check-In", href: "/dashboard/staff/checkin", icon: QrCode },
          {
            title: "Attendees",
            href: "/dashboard/staff/attendees",
            icon: Users,
          },
          {
            title: "My Events",
            href: "/dashboard/staff/events",
            icon: Calendar,
          },
        ];
      case "customer":
        return [
          {
            title: "Dashboard",
            href: "/dashboard/customer",
            icon: LayoutDashboard,
          },
          {
            title: "My Tickets",
            href: "/dashboard/customer/tickets",
            icon: Ticket,
          },
          { title: "Browse Events", href: "/events", icon: Calendar },
          {
            title: "Investments",
            href: "/dashboard/customer/investments",
            icon: DollarSign,
          },
          { title: "Wallet", href: "/dashboard/customer/wallet", icon: Wallet },
        ];
      case "admin":
        return [
          {
            title: "Dashboard",
            href: "/dashboard/admin",
            icon: LayoutDashboard,
          },
          {
            title: "All Events",
            href: "/dashboard/admin/events",
            icon: Calendar,
          },
          {
            title: "Event Approval",
            href: "/dashboard/admin/approvals",
            icon: ShieldCheck,
          },
          { title: "Users", href: "/dashboard/admin/users", icon: Users },
          {
            title: "Transactions",
            href: "/dashboard/admin/transactions",
            icon: DollarSign,
          },
          {
            title: "Pool Management",
            href: "/dashboard/admin/pools",
            icon: Database,
          },
          {
            title: "Analytics",
            href: "/dashboard/admin/analytics",
            icon: TrendingUp,
          },
        ];
      case "investor":
        return [
          {
            title: "Dashboard",
            href: "/dashboard/investor",
            icon: LayoutDashboard,
          },
          {
            title: "Campaigns",
            href: "/dashboard/investor/campaigns",
            icon: Target,
          },
          {
            title: "My Investments",
            href: "/dashboard/investor/investments",
            icon: DollarSign,
          },
          { title: "Voting", href: "/dashboard/investor/voting", icon: Vote },
          {
            title: "Rewards",
            href: "/dashboard/investor/rewards",
            icon: Ticket,
          },
          {
            title: "Portfolio",
            href: "/dashboard/investor/portfolio",
            icon: TrendingUp,
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="space-y-1 p-4">
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#90E0EF] uppercase tracking-wider px-3">
          {role.charAt(0).toUpperCase() + role.slice(1)} Menu
        </p>
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#0077B6]",
              isActive
                ? "bg-[#0077B6] text-white shadow-lg"
                : "text-[#CAF0F8] hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-[#48CAE4] px-2 py-0.5 text-xs font-semibold text-[#03045E]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
