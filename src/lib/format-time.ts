import {
  format,
  isToday,
  isYesterday,
  isThisYear,
} from "date-fns";

/**
 * Format a message timestamp according to recency:
 * - Today: "2:34 PM"
 * - Yesterday: "Yesterday, 2:34 PM"
 * - This year: "Feb 15, 2:34 PM"
 * - Older: "Feb 15, 2024, 2:34 PM"
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }

  if (isThisYear(date)) {
    return format(date, "MMM d, h:mm a");
  }

  return format(date, "MMM d, yyyy, h:mm a");
}

/**
 * Format a conversation sidebar timestamp (compact).
 * - Today: "2:34 PM"
 * - This week: "Mon"
 * - This year: "Feb 15"
 * - Older: "2/15/24"
 */
export function formatSidebarTime(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  if (isThisYear(date)) {
    return format(date, "MMM d");
  }

  return format(date, "M/d/yy");
}
