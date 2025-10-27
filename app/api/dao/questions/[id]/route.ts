import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// DELETE /api/dao/questions/[id] - Delete a DAO question and its options
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServiceSupabase();

    // Delete the question (options will be cascade deleted if foreign key is set up properly)
    // If not, we need to delete options first
    const { error: optionsError } = await supabase
      .from("dao_options")
      .delete()
      .eq("question_id", id);

    if (optionsError) {
      console.error("Error deleting options:", optionsError);
      return NextResponse.json(
        { error: "Failed to delete question options" },
        { status: 500 }
      );
    }

    // Delete any votes for this question
    const { error: votesError } = await supabase
      .from("dao_question_votes")
      .delete()
      .eq("question_id", id);

    if (votesError) {
      console.error("Error deleting votes:", votesError);
      // Continue anyway - might not have votes yet
    }

    // Delete the question
    const { error: questionError } = await supabase
      .from("dao_questions")
      .delete()
      .eq("id", id);

    if (questionError) {
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Question deleted successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Delete question error:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
