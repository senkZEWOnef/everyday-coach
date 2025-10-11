import { NextRequest, NextResponse } from "next/server";
import { db, meals, nutritionGoals } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/nutrition - Get meals and goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let mealsQuery = db.select().from(meals);
    if (date) {
      mealsQuery = mealsQuery.where(eq(meals.date, date));
    }
    
    const allMeals = await mealsQuery;
    const goals = await db.select().from(nutritionGoals).limit(1);
    
    return NextResponse.json({
      meals: allMeals,
      goals: goals[0] || { kcalTarget: 2400, proteinTarget: "150" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch nutrition data" }, { status: 500 });
  }
}

// POST /api/nutrition - Add a meal
export async function POST(request: NextRequest) {
  try {
    const mealData = await request.json();
    
    const [newMeal] = await db.insert(meals).values({
      name: mealData.name,
      kcal: mealData.kcal,
      protein: mealData.protein.toString(),
      date: mealData.date,
      imageUrl: mealData.imageUrl,
    }).returning();
    
    return NextResponse.json(newMeal);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add meal" }, { status: 500 });
  }
}

// PUT /api/nutrition/goals - Update nutrition goals
export async function PUT(request: NextRequest) {
  try {
    const { kcalTarget, proteinTarget } = await request.json();
    
    // Check if goals exist
    const existingGoals = await db.select().from(nutritionGoals).limit(1);
    
    if (existingGoals.length > 0) {
      // Update existing
      const [updatedGoals] = await db.update(nutritionGoals)
        .set({
          kcalTarget,
          proteinTarget: proteinTarget.toString(),
          updatedAt: new Date(),
        })
        .where(eq(nutritionGoals.id, existingGoals[0].id))
        .returning();
      
      return NextResponse.json(updatedGoals);
    } else {
      // Create new
      const [newGoals] = await db.insert(nutritionGoals).values({
        kcalTarget,
        proteinTarget: proteinTarget.toString(),
      }).returning();
      
      return NextResponse.json(newGoals);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
  }
}