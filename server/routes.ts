import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertCalendarFeedSchema, insertTodoSchema } from "@shared/schema";
import { z } from "zod";
import { parseCalendarUrl } from "../client/src/lib/ical";

export async function registerRoutes(app: Express) {
  // Calendar Feed Routes
  app.get("/api/feeds", async (_req, res) => {
    const feeds = await storage.getFeeds();
    res.json(feeds);
  });

  app.post("/api/feeds", async (req, res) => {
    const result = insertCalendarFeedSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid feed data" });
    }

    try {
      const events = await parseCalendarUrl(result.data.url);
      const feed = await storage.createFeed(result.data);

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

  app.delete("/api/feeds/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteFeed(id);
    if (!deleted) {
      return res.status(404).json({ error: "Feed not found" });
    }
    res.json({ success: true });
  });

  // Todo Routes
  app.get("/api/todos", async (req, res) => {
    const feedId = req.query.feedId ? parseInt(req.query.feedId as string) : undefined;
    const todos = await storage.getTodos(feedId);
    res.json(todos);
  });

  app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertTodoSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid todo data" });
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
