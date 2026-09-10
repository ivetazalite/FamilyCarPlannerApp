import { format } from 'date-fns/format';
import { toZonedTime } from 'date-fns-tz';

export function toDisplayTime(utcDateStr: string, timezone: string): string {
  try {
    const date = new Date(utcDateStr);
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'EEE d MMM, HH:mm');
  } catch {
    return utcDateStr;
  }
}

export function toDisplayDate(utcDateStr: string, timezone: string): string {
  try {
    const date = new Date(utcDateStr);
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'EEEE d MMMM yyyy');
  } catch {
    return utcDateStr;
  }
}

export function toDisplayTimeOnly(utcDateStr: string, timezone: string): string {
  try {
    const date = new Date(utcDateStr);
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'HH:mm');
  } catch {
    return '';
  }
}

export function toRelativeTime(utcDateStr: string): string {
  try {
    const date = new Date(utcDateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'yesterday';
    return `${diffDay} days ago`;
  } catch {
    return '';
  }
}

export const IANA_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Vienna',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Budapest',
  'Europe/Bucharest',
  'Europe/Athens',
  'Europe/Helsinki',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Lisbon',
  'Europe/Dublin',
  'Europe/Zurich',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Tehran',
  'Asia/Istanbul',
  'Asia/Jerusalem',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
];
