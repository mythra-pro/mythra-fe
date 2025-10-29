import {
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Database,
  FileCheck,
  CreditCard,
  BarChart3,
  Plus,
  UserCheck,
  Wallet,
  PieChart,
  Target,
  Vote,
  Briefcase,
  Building,
  CheckCircle,
  Ticket,
} from "lucide-react";
import { MenuSection } from "@/components/dashboard-layout";
import { UserRole } from "@/app/types/user";

export function getMenuSectionsForRole(role: UserRole): MenuSection[] {
  switch (role) {
    case "admin":
      return [
        {
          title: "Overview",
          items: [
            {
              title: "Dashboard",
              href: "/dashboard/admin",
              icon: LayoutDashboard,
            },
            {
              title: "Analytics",
              href: "/dashboard/admin/analytics",
              icon: BarChart3,
            },
          ],
        },
        {
          title: "Management",
          items: [
            {
              title: "Enable Ticket Selling",
              href: "/dashboard/admin/enable-selling",
              icon: Ticket,
            },
            {
              title: "Users",
              href: "/dashboard/admin/users",
              icon: Users,
            },
            {
              title: "Approvals",
              href: "/dashboard/admin/approvals",
              icon: FileCheck,
              badge: "3", // This could be dynamic
            },
            {
              title: "Transactions",
              href: "/dashboard/admin/transactions",
              icon: CreditCard,
            },
          ],
        },
        {
          title: "System",
          items: [
            {
              title: "Platform Settings",
              href: "/dashboard/admin/settings",
              icon: ShieldCheck,
            },
          ],
        },
      ];

    case "organizer":
      return [
        {
          title: "Overview",
          items: [
            {
              title: "Dashboard",
              href: "/dashboard/organizer",
              icon: LayoutDashboard,
            },
            {
              title: "Analytics",
              href: "/dashboard/organizer/analytics",
              icon: TrendingUp,
            },
          ],
        },
        {
          title: "Events",
          items: [
            {
              title: "Create Event",
              href: "/dashboard/organizer/create",
              icon: Plus,
            },
            {
              title: "My Events",
              href: "/dashboard/organizer/events",
              icon: Calendar,
            },
          ],
        },
        {
          title: "Team & Finance",
          items: [
            {
              title: "Staff Management",
              href: "/dashboard/organizer/staff",
              icon: UserCheck,
            },
            {
              title: "Payouts",
              href: "/dashboard/organizer/payouts",
              icon: Wallet,
            },
          ],
        },
      ];

    case "investor":
      return [
        {
          title: "Overview",
          items: [
            {
              title: "Dashboard",
              href: "/dashboard/investor",
              icon: LayoutDashboard,
            },
            {
              title: "Portfolio",
              href: "/dashboard/investor/portfolio",
              icon: Briefcase,
            },
          ],
        },
        {
          title: "Investments",
          items: [
            {
              title: "Opportunities",
              href: "/dashboard/investor/opportunities",
              icon: Target,
            },
            {
              title: "Active Campaigns",
              href: "/dashboard/investor/campaigns",
              icon: Briefcase,
            },
            {
              title: "Voting",
              href: "/dashboard/investor/voting",
              icon: Vote,
              badge: "2", // Could show pending votes
            },
          ],
        },
        {
          title: "Analytics",
          items: [
            {
              title: "Performance",
              href: "/dashboard/investor/performance",
              icon: PieChart,
            },
          ],
        },
      ];

    case "customer":
      return [
        {
          title: "Overview",
          items: [
            {
              title: "Dashboard",
              href: "/dashboard/customer",
              icon: LayoutDashboard,
            },
            {
              title: "My Investments",
              href: "/dashboard/customer/investments",
              icon: Building,
            },
          ],
        },
        {
          title: "Events",
          items: [
            {
              title: "Browse Events",
              href: "/events",
              icon: Calendar,
            },
            {
              title: "My Tickets",
              href: "/dashboard/customer/tickets",
              icon: CheckCircle,
            },
          ],
        },
      ];

    case "staff":
      return [
        {
          title: "Overview",
          items: [
            {
              title: "Dashboard",
              href: "/dashboard/staff",
              icon: LayoutDashboard,
            },
          ],
        },
        {
          title: "Operations",
          items: [
            {
              title: "Check-in",
              href: "/dashboard/staff/checkin",
              icon: CheckCircle,
            },
            {
              title: "Event Management",
              href: "/dashboard/staff/events",
              icon: Calendar,
            },
          ],
        },
      ];

    default:
      return [
        {
          items: [
            {
              title: "Dashboard",
              href: "/dashboard",
              icon: LayoutDashboard,
            },
          ],
        },
      ];
  }
}

// Utility function to get menu sections with dynamic badges/counts
export function getMenuSectionsWithCounts(
  role: UserRole,
  counts?: {
    pendingApprovals?: number;
    pendingVotes?: number;
    notifications?: number;
  }
): MenuSection[] {
  const sections = getMenuSectionsForRole(role);

  if (counts) {
    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        let badge = item.badge;

        // Update specific badges based on counts
        if (item.href.includes("approvals") && counts.pendingApprovals) {
          badge = counts.pendingApprovals.toString();
        } else if (item.href.includes("voting") && counts.pendingVotes) {
          badge = counts.pendingVotes.toString();
        }

        return {
          ...item,
          badge: badge === "0" ? undefined : badge,
        };
      }),
    }));
  }

  return sections;
}
