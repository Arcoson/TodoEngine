import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { parseCalendarUrl } from "../client/src/lib/ical";
import { storage } from "./storage";
import { type CalendarEvent } from "../client/src/lib/ical";

interface WebSocketClient extends WebSocket {
  userId?: number;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Map<number, WebSocketClient[]>();

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('Client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          ws.userId = data.userId;
          if (!clients.has(data.userId)) {
            clients.set(data.userId, []);
          }
          clients.get(data.userId)?.push(ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        const userClients = clients.get(ws.userId);
        if (userClients) {
          clients.set(ws.userId, userClients.filter(client => client !== ws));
        }
      }
    });
  });

  return {
    notifyUserOfChanges: (userId: number, feedId: number, newEvents: CalendarEvent[]) => {
      const userClients = clients.get(userId);
      if (userClients) {
        const message = JSON.stringify({
          type: 'calendarUpdate',
          feedId,
          events: newEvents,
        });
        
        userClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    }
  };
}
