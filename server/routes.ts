import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCalendarFeedSchema, insertTodoSchema } from "@shared/schema";
import { z } from "zod";
import { parseCalendarUrl } from "../client/src/lib/ical";
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  // Protected Calendar Feed Routes
  app.get("/api/feeds", isAuthenticated, async (req, res) => {
    const feeds = await storage.getFeeds();
    // Filter feeds by user
    const userFeeds = feeds.filter(feed => feed.userId === req.user!.id);
    res.json(userFeeds);
  });

  app.post("/api/feeds", isAuthenticated, async (req, res) => {
    const result = insertCalendarFeedSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid feed data" });
    }

    try {
      const events = await parseCalendarUrl(result.data.url);
      const feed = await storage.createFeed({
        ...result.data,
        userId: req.user!.id,
      });

      // Create todos from events
      for (const event of events) {
        await storage.createTodo({
          title: event.summary,
          description: event.description,
          dueDate: event.start,
          completed: false,
          feedId: feed.id,
          eventUid: event.uid,
        });
      }

      res.json(feed);
    } catch (error) {
      res.status(400).json({ error: "Failed to parse calendar feed" });
    }
  });

  app.delete("/api/feeds/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const feed = await storage.getFeed(id);

    if (!feed || feed.userId !== req.user!.id) {
      return res.status(404).json({ error: "Feed not found" });
    }

    const deleted = await storage.deleteFeed(id);
    if (!deleted) {
      return res.status(404).json({ error: "Feed not found" });
    }
    res.json({ success: true });
  });

  // Protected Todo Routes
  app.get("/api/todos", isAuthenticated, async (req, res) => {
    const feedId = req.query.feedId ? parseInt(req.query.feedId as string) : undefined;

    if (feedId) {
      const feed = await storage.getFeed(feedId);
      if (!feed || feed.userId !== req.user!.id) {
        return res.status(404).json({ error: "Feed not found" });
      }
    }

    const todos = await storage.getTodos(feedId);
    res.json(todos);
  });

  app.patch("/api/todos/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertTodoSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid todo data" });
    }

    const todo = await storage.getTodo(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Check if the todo belongs to a feed owned by the user
    const feed = await storage.getFeed(todo.feedId!);
    if (!feed || feed.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = await storage.updateTodo(id, result.data);
    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}