"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Wallet, Shield, Zap, Users, Crown } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: string;
  className?: string;
}

const roleConfig = {
  organizer: {
    label: "Event Organizer",
    icon: Users,
    color: "bg-blue-600",
    description: "Create and manage events",
  },
  customer: {
    label: "Customer",
    icon: Wallet,
    color: "bg-green-600",
    description: "Purchase and manage tickets",
  },
  investor: {
    label: "Investor",
    icon: Zap,
    color: "bg-purple-600",
    description: "Fund campaigns and earn rewards",
  },
  staff: {
    label: "Staff",
    icon: Shield,
    color: "bg-orange-600",
    description: "Check-in attendees",
  },
  admin: {
    label: "Admin",
    icon: Crown,
    color: "bg-red-600",
    description: "System administration",
  },
};

export function RoleSwitcher({ currentRole, className }: RoleSwitcherProps) {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [availableRoles, setAvailableRoles] = useState<string[]>([currentRole]);
  const [loading, setLoading] = useState(false);

  // Fetch available roles for this user
  useEffect(() => {
    if (!publicKey) return;

    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/users/${publicKey.toString()}/roles`);
        const data = await response.json();
        
        if (data.success && data.roles.length > 0) {
          setAvailableRoles(data.roles);
        }
      } catch (error) {
        console.error("Failed to fetch user roles:", error);
      }
    };

    fetchRoles();
  }, [publicKey]);

  const handleRoleSwitch = (newRole: string) => {
    if (newRole === currentRole) return;
    
    setLoading(true);
    // Update localStorage
    localStorage.setItem("userRole", newRole);
    
    // Redirect to new dashboard
    router.push(`/dashboard/${newRole}`);
  };

  // Don't show switcher if user only has one role
  if (availableRoles.length <= 1) {
    return null;
  }

  const CurrentRoleConfig = roleConfig[currentRole as keyof typeof roleConfig] || roleConfig.organizer;
  const CurrentIcon = CurrentRoleConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
          disabled={loading}
        >
          <div className={`h-2 w-2 rounded-full ${CurrentRoleConfig.color}`} />
          <CurrentIcon className="h-4 w-4" />
          <span className="font-medium">{CurrentRoleConfig.label}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => {
          const config = roleConfig[role as keyof typeof roleConfig];
          if (!config) return null;
          
          const Icon = config.icon;
          const isActive = role === currentRole;

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className="cursor-pointer"
              disabled={isActive}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{config.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
