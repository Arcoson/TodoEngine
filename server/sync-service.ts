import { storage } from "./storage";
import { parseCalendarUrl } from "../client/src/lib/ical";
import type { CalendarEvent } from "../client/src/lib/ical";

export class SyncService {
  private wsNotifier: (userId: number, feedId: number, events: CalendarEvent[]) => void;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(notifier: (userId: number, feedId: number, events: CalendarEvent[]) => void) {
    this.wsNotifier = notifier;
  }

  start() {
    // Check for updates every minute
    this.syncInterval = setInterval(() => this.checkForUpdates(), 60 * 1000);
    // Do an initial sync
    this.checkForUpdates();
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  private async checkForUpdates() {
    try {
      const feeds = await storage.getFeeds();

      for (const feed of feeds) {
        await this.syncFeed(feed.id);
      }
    } catch (error) {
      console.error('Error syncing calendars:', error);
    }
  }

  // Manual sync for immediate update
  async syncFeed(feedId: number) {
    try {
      const feed = await storage.getFeed(feedId);
      if (!feed) return [];

      const events = await parseCalendarUrl(feed.url);
      const todos = await storage.getTodos(feed.id);

      // Check for new or updated events
      for (const event of events) {
        const existingTodo = todos.find(todo => todo.eventUid === event.uid);

        if (!existingTodo) {
          // New event, create todo with default medium priority
          await storage.createTodo({
            title: event.summary,
            description: event.description || "",
            dueDate: event.start,
            completed: false,
            priority: "medium", // Default priority for new todos
            feedId: feed.id,
            eventUid: event.uid,
          });
          console.log(`Created new todo for event: ${event.summary}`);
        } else if (
          existingTodo.dueDate?.getTime() !== event.start.getTime() ||
          existingTodo.title !== event.summary ||
          existingTodo.description !== event.description
        ) {
          // Event updated, update todo but maintain existing priority
          await storage.updateTodo(existingTodo.id, {
            title: event.summary,
            description: event.description || "",
            dueDate: event.start,
            // Keep existing priority
            priority: existingTodo.priority,
          });
          console.log(`Updated todo for event: ${event.summary}`);
        }
      }

      // Check for deleted events
      for (const todo of todos) {
        if (todo.eventUid && !events.find(event => event.uid === todo.eventUid)) {
          await storage.deleteTodo(todo.id);
          console.log(`Deleted todo for removed event: ${todo.title}`);
        }
      }

      this.wsNotifier(feed.userId, feed.id, events);
      return events;
    } catch (error) {
      console.error(`Error syncing feed ${feedId}:`, error);
      return [];
    }
  }
}