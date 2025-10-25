import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/roi/distribute - Distribute ROI to investors
export async function POST(req: Request) {
  try {
    const { 
      eventId, 
      organizerId, 
      totalRevenue, 
      totalCosts, 
      investorSharePercentage = 20 
    } = await req.json();

    if (!eventId || !organizerId || totalRevenue === undefined || totalCosts === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify event belongs to organizer and is completed
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("organizer_id", organizerId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    if (event.status !== "completed") {
      return NextResponse.json(
        { error: "Event must be completed before distributing ROI" },
        { status: 400 }
      );
    }

    // Calculate net profit and ROI pool
    const netProfit = totalRevenue - totalCosts;
    const totalRoiPool = (netProfit * investorSharePercentage) / 100;

    if (totalRoiPool <= 0) {
      return NextResponse.json(
        { error: "No profit available for ROI distribution" },
        { status: 400 }
      );
    }

    // Create ROI distribution record
    const { data: distribution, error: distError } = await supabase
      .from("roi_distributions")
      .insert({
        event_id: eventId,
        total_revenue: totalRevenue,
        total_costs: totalCosts,
        net_profit: netProfit,
        investor_share_percentage: investorSharePercentage,
        total_roi_pool: totalRoiPool,
        status: "pending",
      })
      .select()
      .single();

    if (distError) {
      console.error("❌ Error creating ROI distribution:", distError);
      return NextResponse.json(
        { error: distError.message },
        { status: 500 }
      );
    }

    // Get all investments for this event
    const { data: investments, error: investError } = await supabase
      .from("investments")
      .select("*")
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (investError) {
      console.error("❌ Error fetching investments:", investError);
      return NextResponse.json(
        { error: investError.message },
        { status: 500 }
      );
    }

    if (!investments || investments.length === 0) {
      return NextResponse.json(
        { error: "No investments found for this event" },
        { status: 400 }
      );
    }

    // Calculate total investment amount
    const totalInvestmentAmount = investments.reduce(
      (sum: number, inv: any) => sum + inv.amount_sol,
      0
    );

    // Calculate ROI for each investor
    const investorRois = investments.map((investment: any) => {
      const roiPercentage = (investment.amount_sol / totalInvestmentAmount) * 100;
      const roiAmount = (totalRoiPool * investment.amount_sol) / totalInvestmentAmount;

      return {
        distribution_id: distribution.id,
        investment_id: investment.id,
        investor_id: investment.investor_id,
        investor_wallet: investment.investor_wallet,
        investment_amount: investment.amount_sol,
        roi_amount: roiAmount,
        roi_percentage: roiPercentage,
        paid: false,
      };
    });

    // Insert investor ROIs
    const { error: roiError } = await supabase
      .from("investor_rois")
      .insert(investorRois);

    if (roiError) {
      console.error("❌ Error creating investor ROIs:", roiError);
      // Rollback distribution
      await supabase.from("roi_distributions").delete().eq("id", distribution.id);
      return NextResponse.json(
        { error: roiError.message },
        { status: 500 }
      );
    }

    console.log("✅ ROI distribution created:", distribution.id);
    return NextResponse.json({ 
      distribution,
      investor_rois: investorRois
    }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/roi/distribute:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
