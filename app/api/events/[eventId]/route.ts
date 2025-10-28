import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/events/[eventId] - Get event by ID or slug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = getServiceSupabase();

    // Try to find by ID first, then by slug
    // Use explicit foreign key constraint name to avoid ambiguity
    // when events table has multiple relationships to users table
    let query = supabase
      .from("events")
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, display_name, wallet_address, email),
        ticket_tiers(*)
      `);

    // Check if ID is UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);

    if (isUuid) {
      query = query.eq("id", eventId);
    } else {
      query = query.eq("slug", eventId);
    }

    const { data: event, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[eventId] - Update event
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await req.json();
    const {
      name,
      description,
      venue,
      category,
      startTime,
      endTime,
      maxTickets,
      status,
    } = body;

    const supabase = getServiceSupabase();

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (venue !== undefined) updates.venue = venue;
    if (category !== undefined) updates.category = category;
    if (startTime !== undefined) updates.start_time = new Date(startTime).toISOString();
    if (endTime !== undefined) updates.end_time = endTime ? new Date(endTime).toISOString() : null;
    if (maxTickets !== undefined) updates.max_tickets = maxTickets;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId] - Delete event
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
