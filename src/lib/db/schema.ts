import { pgTable, text, integer, timestamp, boolean, uuid, decimal } from "drizzle-orm/pg-core";

// Users table (for future expansion if you want multi-user support)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Habits
export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id"), // Optional for now, can link to users table later
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitCompletions = pgTable("habit_completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  habitId: uuid("habit_id").references(() => habits.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
});

// Books
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  rating: integer("rating").default(0),
  notes: text("notes").default(""),
  status: text("status").notNull().default("to-read"), // "reading", "completed", "to-read"
  pages: integer("pages").default(0),
  currentPage: integer("current_page").default(0),
  dateRead: text("date_read"), // YYYY-MM-DD format
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition
export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kcal: integer("kcal").notNull(),
  protein: decimal("protein").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  imageUrl: text("image_url"),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nutritionGoals = pgTable("nutrition_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  kcalTarget: integer("kcal_target").default(2400),
  proteinTarget: decimal("protein_target").default("150"),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workouts
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(), // YYYY-MM-DD format
  exercise: text("exercise").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: decimal("weight").notNull(),
  bodyWeight: decimal("body_weight"),
  notes: text("notes"),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(), // YYYY-MM-DD format
  plan: text("plan").notNull(),
  isCompleted: boolean("is_completed").default(false),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time"),
  category: text("category").default("personal"),
  isCompleted: boolean("is_completed").default(false),
  reminderTime: integer("reminder_time"), // minutes before event
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => calendarEvents.id),
  type: text("type").notNull(), // "reminder", "completion", etc.
  isRead: boolean("is_read").default(false),
  scheduledFor: timestamp("scheduled_for").notNull(),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});