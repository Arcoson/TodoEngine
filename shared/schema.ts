import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarFeeds = pgTable("calendar_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Add priority enum
export const Priority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"),  // Add priority field
  feedId: integer("feed_id").references(() => calendarFeeds.id),
  eventUid: text("event_uid"), // Original iCal event UID
});

// Relations remain unchanged
export const userRelations = relations(users, ({ many }) => ({
  feeds: many(calendarFeeds),
}));

export const calendarFeedRelations = relations(calendarFeeds, ({ many, one }) => ({
  todos: many(todos),
  user: one(users, {
    fields: [calendarFeeds.userId],
    references: [users.id],
  }),
}));

export const todoRelations = relations(todos, ({ one }) => ({
  feed: one(calendarFeeds, {
    fields: [todos.feedId],
    references: [calendarFeeds.id],
  }),
}));

// Update schemas for input validation
export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertCalendarFeedSchema = createInsertSchema(calendarFeeds).omit({ userId: true });
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true }).extend({
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW]).default(Priority.MEDIUM),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCalendarFeed = z.infer<typeof insertCalendarFeedSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type User = typeof users.$inferSelect;
export type CalendarFeed = typeof calendarFeeds.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type Priority = keyof typeof Priority;
