import { calendarFeeds, todos, type CalendarFeed, type Todo, type InsertCalendarFeed, type InsertTodo } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Calendar Feed operations
  getFeeds(): Promise<CalendarFeed[]>;
  getFeed(id: number): Promise<CalendarFeed | undefined>;
  createFeed(feed: InsertCalendarFeed): Promise<CalendarFeed>;
  deleteFeed(id: number): Promise<boolean>;

  // Todo operations
  getTodos(feedId?: number): Promise<Todo[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getFeeds(): Promise<CalendarFeed[]> {
    return await db.select().from(calendarFeeds);
  }

  async getFeed(id: number): Promise<CalendarFeed | undefined> {
    const [feed] = await db.select().from(calendarFeeds).where(eq(calendarFeeds.id, id));
    return feed;
  }

  async createFeed(feed: InsertCalendarFeed): Promise<CalendarFeed> {
    const [newFeed] = await db.insert(calendarFeeds).values(feed).returning();
    return newFeed;
  }

  async deleteFeed(id: number): Promise<boolean> {
    const [deleted] = await db.delete(calendarFeeds).where(eq(calendarFeeds.id, id)).returning();
    return !!deleted;
  }

  async getTodos(feedId?: number): Promise<Todo[]> {
    if (feedId !== undefined) {
      return await db.select().from(todos).where(eq(todos.feedId, feedId));
    }
    return await db.select().from(todos);
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    return todo;
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todos).values({
      ...todo,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    }).returning();
    return newTodo;
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo | undefined> {
    const [updated] = await db
      .update(todos)
      .set({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      })
      .where(eq(todos.id, id))
      .returning();
    return updated;
  }

  async deleteTodo(id: number): Promise<boolean> {
    const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();