import { NextRequest, NextResponse } from "next/server";
import { db, habits, habitCompletions } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// GET /api/habits - Get all habits and their completions
export async function GET() {
  try {
    const allHabits = await db.select().from(habits);
    const allCompletions = await db.select().from(habitCompletions);
    
    return NextResponse.json({
      habits: allHabits,
      completions: allCompletions,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    const [newHabit] = await db.insert(habits).values({
      name,
    }).returning();
    
    return NextResponse.json(newHabit);
  } catch {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}

// PUT /api/habits - Toggle habit completion
export async function PUT(request: NextRequest) {
  try {
    const { habitId, date, completed } = await request.json();
    
    if (completed) {
      // Add completion
      await db.insert(habitCompletions).values({
        habitId,
        date,
      });
    } else {
      // Remove completion
      await db.delete(habitCompletions)
        .where(and(
          eq(habitCompletions.habitId, habitId),
          eq(habitCompletions.date, date)
        ));
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 });
  }
}