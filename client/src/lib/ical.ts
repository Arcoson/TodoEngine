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
      currentEvent = {};
    } else if (line.startsWith("UID:")) {
      currentEvent.uid = line.slice(4).trim();
    } else if (line.startsWith("SUMMARY:")) {
      currentEvent.summary = line.slice(8).trim();
    } else if (line.startsWith("DESCRIPTION:")) {
      currentEvent.description = line.slice(12).trim();
    } else if (line.startsWith("DTSTART")) {
      // Handle both date-time and date formats
      const dateStr = line.includes(":") 
        ? line.split(":")[1].trim()
        : line.split(";")[1].split(":")[1].trim();

      // Convert from YYYYMMDDTHHMMSSZ format
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const hour = dateStr.slice(9, 11) || "00";
      const minute = dateStr.slice(11, 13) || "00";
      const second = dateStr.slice(13, 15) || "00";

      currentEvent.start = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    }
  }

  return events;
}