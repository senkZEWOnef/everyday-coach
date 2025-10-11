import { NextRequest, NextResponse } from "next/server";
import { db, workouts, workoutPlans } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/workouts - Get workouts and plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let workoutsQuery = db.select().from(workouts);
    let plansQuery = db.select().from(workoutPlans);
    
    if (date) {
      workoutsQuery = workoutsQuery.where(eq(workouts.date, date));
      plansQuery = plansQuery.where(eq(workoutPlans.date, date));
    }
    
    const allWorkouts = await workoutsQuery;
    const plans = await plansQuery;
    
    return NextResponse.json({
      workouts: allWorkouts,
      plans: plans,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

// POST /api/workouts - Add a workout entry
export async function POST(request: NextRequest) {
  try {
    const workoutData = await request.json();
    
    const [newWorkout] = await db.insert(workouts).values({
      date: workoutData.date,
      exercise: workoutData.exercise,
      sets: workoutData.sets,
      reps: workoutData.reps,
      weight: workoutData.weight.toString(),
      bodyWeight: workoutData.bodyWeight ? workoutData.bodyWeight.toString() : null,
      notes: workoutData.notes,
    }).returning();
    
    return NextResponse.json(newWorkout);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add workout" }, { status: 500 });
  }
}

// PUT /api/workouts/plan - Update workout plan
export async function PUT(request: NextRequest) {
  try {
    const { date, plan, isCompleted } = await request.json();
    
    // Check if plan exists for this date
    const existingPlan = await db.select().from(workoutPlans)
      .where(eq(workoutPlans.date, date)).limit(1);
    
    if (existingPlan.length > 0) {
      // Update existing
      const [updatedPlan] = await db.update(workoutPlans)
        .set({ plan, isCompleted })
        .where(eq(workoutPlans.id, existingPlan[0].id))
        .returning();
      
      return NextResponse.json(updatedPlan);
    } else {
      // Create new
      const [newPlan] = await db.insert(workoutPlans).values({
        date,
        plan,
        isCompleted: isCompleted || false,
      }).returning();
      
      return NextResponse.json(newPlan);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update workout plan" }, { status: 500 });
  }
}