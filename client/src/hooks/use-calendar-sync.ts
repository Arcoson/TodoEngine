import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { queryClient } from "@/lib/queryClient";

export function useCalendarSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'calendarUpdate') {
          // Invalidate todos query to trigger a refresh
          queryClient.invalidateQueries({
            queryKey: ["/api/todos", data.feedId],
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      socket.close();
    };
  }, [user]);
}
