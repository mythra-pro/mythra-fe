import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/[wallet]/roles
 * Fetch all active roles for a user by wallet address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Supabase query when integrated
    // For now, return mock data based on wallet
    
    // Simulate database query
    const userRoles = await fetchUserRolesFromDB(wallet);

    return NextResponse.json({
      success: true,
      wallet,
      roles: userRoles,
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

/**
 * Mock function - replace with actual Supabase query
 */
async function fetchUserRolesFromDB(wallet: string): Promise<string[]> {
  // TODO: Implement actual Supabase query:
  /*
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      roles (
        name
      )
    `)
    .eq('user_id', (
      await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', wallet)
        .single()
    ).data?.id)
    .eq('status', 'active');
  
  return data?.map(ur => ur.roles.name) || [];
  */

  // Mock data for development
  // Most users have only 1 role, some power users have multiple
  const multiRoleWallets = [
    'Cm46ieDFKRiRHjY8LdVegP9U3ndabXoKic6pVQ7uasRt', // Test wallet 1
    '3Bdy3rjj9XpZrtCQqcTxdJxLAQM6Ncw33hDPGe2zqUnA', // Test wallet 2 (current user)
    'B43gicVW5rsfibDNHzaHkjdX7sDbo7sdiWhSwLDcndmW'
  ];

  if (multiRoleWallets.includes(wallet)) {
    // User with multiple roles
    return ['organizer', 'investor', 'customer'];
  }

  // Default: single role (organizer)
  // When Supabase is integrated, this will query the actual user_roles table
  return ['organizer'];
}
