/**
 * Event (calendar) QR content. Stored as JSON; landing can show details and "Add to calendar" link.
 */

export type EventFields = {
  title: string;
  start: string; // ISO datetime
  end: string;
  location?: string;
  description?: string;
};

const EVENT_JSON_PREFIX = "EVENT:";

/**
 * Serialize event to content string (JSON with prefix so we can detect type).
 */
export function buildEventString(fields: EventFields): string {
  const { title, start, end, location, description } = fields;
  const payload = { title: title.trim(), start, end, location: location?.trim() ?? "", description: description?.trim() ?? "" };
  return EVENT_JSON_PREFIX + JSON.stringify(payload);
}

/**
 * Parse event content string back to fields.
 */
export function parseEventString(content: string): Partial<EventFields> | null {
  const raw = content.trim();
  if (!raw.startsWith(EVENT_JSON_PREFIX)) {
    try {
      const j = JSON.parse(raw);
      if (typeof j.title === "string") return j as EventFields;
    } catch {
      return null;
    }
    return null;
  }
  try {
    const j = JSON.parse(raw.slice(EVENT_JSON_PREFIX.length));
    return j as EventFields;
  } catch {
    return null;
  }
}

/**
 * Build Google Calendar "Add to calendar" URL.
 */
export function buildGoogleCalendarUrl(fields: EventFields): string {
  const start = fields.start.replace(/[-:]/g, "").replace(/\.\d{3}/, "").slice(0, 15);
  const end = fields.end.replace(/[-:]/g, "").replace(/\.\d{3}/, "").slice(0, 15);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: fields.title,
    dates: `${start}/${end}`,
  });
  if (fields.location) params.set("location", fields.location);
  if (fields.description) params.set("details", fields.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
