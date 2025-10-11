import { NextRequest, NextResponse } from "next/server";
import { db, calendarEvents, notifications } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/calendar - Get calendar events
export async function GET() {
  try {
    const events = await db.select().from(calendarEvents);
    const allNotifications = await db.select().from(notifications);
    
    return NextResponse.json({
      events,
      notifications: allNotifications,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}

// POST /api/calendar - Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    const [newEvent] = await db.insert(calendarEvents).values({
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      category: eventData.category || "personal",
      reminderTime: eventData.reminderTime,
    }).returning();
    
    // Create notification if reminder is set
    if (eventData.reminderTime && eventData.time) {
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
      const reminderDateTime = new Date(eventDateTime.getTime() - (eventData.reminderTime * 60 * 1000));
      
      await db.insert(notifications).values({
        eventId: newEvent.id,
        type: "reminder",
        scheduledFor: reminderDateTime,
      });
    }
    
    return NextResponse.json(newEvent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PUT /api/calendar - Update event completion
export async function PUT(request: NextRequest) {
  try {
    const { eventId, isCompleted } = await request.json();
    
    const [updatedEvent] = await db.update(calendarEvents)
      .set({ isCompleted })
      .where(eq(calendarEvents.id, eventId))
      .returning();
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/calendar - Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }
    
    // Delete associated notifications first
    await db.delete(notifications).where(eq(notifications.eventId, eventId));
    
    // Delete the event
    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}