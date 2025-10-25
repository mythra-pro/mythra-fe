import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/dao/questions?eventId=xxx - Get all DAO questions for an event
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: questions, error } = await supabase
      .from("dao_questions")
      .select("*, options:dao_options(*)")
      .eq("event_id", eventId)
      .order("order", { ascending: true });

    if (error) {
      console.error("❌ Error fetching DAO questions:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ DAO questions fetched:", questions?.length || 0);
    return NextResponse.json({ questions }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/dao/questions:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/dao/questions - Create a new DAO question
export async function POST(req: Request) {
  try {
    const { eventId, question, options, organizerId } = await req.json();

    if (!eventId || !question || !options || !organizerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get current max order
    const { data: existingQuestions } = await supabase
      .from("dao_questions")
      .select("order")
      .eq("event_id", eventId)
      .order("order", { ascending: false })
      .limit(1);

    const nextOrder = existingQuestions && existingQuestions.length > 0 
      ? existingQuestions[0].order + 1 
      : 0;

    // Insert question
    const { data: newQuestion, error: questionError } = await supabase
      .from("dao_questions")
      .insert({
        event_id: eventId,
        question: question,
        created_by: organizerId,
        order: nextOrder,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (questionError) {
      console.error("❌ Error creating question:", questionError);
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      );
    }

    // Insert options
    const optionsData = options.map((opt: string, idx: number) => ({
      question_id: newQuestion.id,
      option_text: opt,
      order: idx,
    }));

    const { error: optionsError } = await supabase
      .from("dao_options")
      .insert(optionsData);

    if (optionsError) {
      console.error("❌ Error creating options:", optionsError);
      // Rollback question
      await supabase.from("dao_questions").delete().eq("id", newQuestion.id);
      return NextResponse.json(
        { error: optionsError.message },
        { status: 500 }
      );
    }

    console.log("✅ DAO question created:", newQuestion.id);
    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/dao/questions:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
