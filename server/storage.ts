import { CalendarFeed, Todo, InsertCalendarFeed, InsertTodo } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private feeds: Map<number, CalendarFeed>;
  private todos: Map<number, Todo>;
  private feedId: number = 1;
  private todoId: number = 1;

  constructor() {
    this.feeds = new Map();
    this.todos = new Map();
  }

  async getFeeds(): Promise<CalendarFeed[]> {
    return Array.from(this.feeds.values());
  }

  async getFeed(id: number): Promise<CalendarFeed | undefined> {
    return this.feeds.get(id);
  }

  async createFeed(feed: InsertCalendarFeed): Promise<CalendarFeed> {
    const id = this.feedId++;
    const newFeed = { ...feed, id };
    this.feeds.set(id, newFeed);
    return newFeed;
  }

  async deleteFeed(id: number): Promise<boolean> {
    return this.feeds.delete(id);
  }

  async getTodos(feedId?: number): Promise<Todo[]> {
    const todos = Array.from(this.todos.values());
    if (feedId !== undefined) {
      return todos.filter(todo => todo.feedId === feedId);
    }
    return todos;
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const id = this.todoId++;
    const newTodo = { ...todo, id };
    this.todos.set(id, newTodo);
    return newTodo;
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo | undefined> {
    const existing = this.todos.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...todo };
    this.todos.set(id, updated);
    return updated;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todos.delete(id);
  }
}

export const storage = new MemStorage();
