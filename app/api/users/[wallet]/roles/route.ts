import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

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
 * Fetch user roles from database by wallet address
 */
async function fetchUserRolesFromDB(wallet: string): Promise<string[]> {
  try {
    const supabase = getServiceSupabase();
    
    // First, get the user ID by wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', wallet)
      .maybeSingle();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return [];
    }
    
    if (!userData) {
      console.log('No user found for wallet:', wallet);
      return [];
    }
    
    // Get all ACTIVE roles for this user
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userData.id)
      .eq('status', 'active');  // Only fetch active roles
    
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return [];
    }
    
    // Extract role names from the nested structure
    const roles = userRoles?.map((ur: any) => ur.roles.name) || [];
    
    console.log(`✅ Fetched ${roles.length} active roles for wallet ${wallet}:`, roles);
    
    return roles;
  } catch (error) {
    console.error('Error in fetchUserRolesFromDB:', error);
    return [];
  }
}
