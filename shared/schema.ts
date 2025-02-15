import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calendarFeeds = pgTable("calendar_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  feedId: integer("feed_id").references(() => calendarFeeds.id),
  eventUid: text("event_uid"), // Original iCal event UID
});

export const insertCalendarFeedSchema = createInsertSchema(calendarFeeds);
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true });

export type InsertCalendarFeed = z.infer<typeof insertCalendarFeedSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type CalendarFeed = typeof calendarFeeds.$inferSelect;
export type Todo = typeof todos.$inferSelect;
