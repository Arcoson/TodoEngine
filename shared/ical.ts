interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  start: Date;
}

export async function parseCalendarUrl(url: string): Promise<CalendarEvent[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch calendar");
  }
  
  const icalData = await res.text();
  // This is a simplified parser. In production, use a proper iCal library
  const events: CalendarEvent[] = [];
  
  const lines = icalData.split("\n");
  let currentEvent: Partial<CalendarEvent> = {};
  
  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (currentEvent.uid && currentEvent.summary && currentEvent.start) {
        events.push(currentEvent as CalendarEvent);
      }
    } else if (line.startsWith("UID:")) {
      currentEvent.uid = line.slice(4).trim();
    } else if (line.startsWith("SUMMARY:")) {
      currentEvent.summary = line.slice(8).trim();
    } else if (line.startsWith("DESCRIPTION:")) {
      currentEvent.description = line.slice(12).trim();
    } else if (line.startsWith("DTSTART:")) {
      const dateStr = line.slice(8).trim();
      currentEvent.start = new Date(dateStr);
    }
  }
  
  return events;
}
