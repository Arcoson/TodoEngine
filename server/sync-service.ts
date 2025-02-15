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
    // Check for updates every 5 minutes
    this.syncInterval = setInterval(() => this.checkForUpdates(), 5 * 60 * 1000);
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
        const events = await parseCalendarUrl(feed.url);
        const todos = await storage.getTodos(feed.id);
        
        // Check for new or updated events
        for (const event of events) {
          const existingTodo = todos.find(todo => todo.eventUid === event.uid);
          
          if (!existingTodo) {
            // New event, create todo
            await storage.createTodo({
              title: event.summary,
              description: event.description,
              dueDate: event.start,
              completed: false,
              feedId: feed.id,
              eventUid: event.uid,
            });
            
            this.wsNotifier(feed.userId, feed.id, events);
          } else if (
            new Date(existingTodo.dueDate!).getTime() !== event.start.getTime() ||
            existingTodo.title !== event.summary ||
            existingTodo.description !== event.description
          ) {
            // Event updated, update todo
            await storage.updateTodo(existingTodo.id, {
              title: event.summary,
              description: event.description,
              dueDate: event.start,
            });
            
            this.wsNotifier(feed.userId, feed.id, events);
          }
        }
        
        // Check for deleted events
        for (const todo of todos) {
          if (todo.eventUid && !events.find(event => event.uid === todo.eventUid)) {
            await storage.deleteTodo(todo.id);
            this.wsNotifier(feed.userId, feed.id, events);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing calendars:', error);
    }
  }

  // Manual sync for immediate update
  async syncFeed(feedId: number) {
    const feed = await storage.getFeed(feedId);
    if (feed) {
      const events = await parseCalendarUrl(feed.url);
      this.wsNotifier(feed.userId, feed.id, events);
      return events;
    }
    return [];
  }
}
