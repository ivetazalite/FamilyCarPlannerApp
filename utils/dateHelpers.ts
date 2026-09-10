import { startOfWeek } from 'date-fns/startOfWeek';
import { endOfWeek } from 'date-fns/endOfWeek';
import { addWeeks } from 'date-fns/addWeeks';
import { subWeeks } from 'date-fns/subWeeks';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { format } from 'date-fns/format';
import { addMinutes } from 'date-fns/addMinutes';
import { isSameDay } from 'date-fns/isSameDay';
import { areIntervalsOverlapping } from 'date-fns/areIntervalsOverlapping';
import { toZonedTime } from 'date-fns-tz';
import type { Reservation } from '@/types';

export const SLOT_START_HOUR = 6;
export const SLOT_END_HOUR = 22;
export const SLOT_HEIGHT = 48;
export const SLOT_DURATION_MINUTES = 30;
export const COLUMN_WIDTH = 120;

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

export function getNextWeek(date: Date): Date {
  return addWeeks(date, 1);
}

export function getPrevWeek(date: Date): Date {
  return subWeeks(date, 1);
}

export function getWeekDays(weekStart: Date): Date[] {
  return eachDayOfInterval({ start: weekStart, end: getWeekEnd(weekStart) });
}

export function generateTimeSlots(): Date[] {
  const slots: Date[] = [];
  const base = new Date();
  base.setHours(SLOT_START_HOUR, 0, 0, 0);
  const totalSlots =
    ((SLOT_END_HOUR - SLOT_START_HOUR) * 60) / SLOT_DURATION_MINUTES;
  for (let i = 0; i <= totalSlots; i++) {
    slots.push(addMinutes(base, i * SLOT_DURATION_MINUTES));
  }
  return slots;
}

export function formatSlotTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  const startStr = format(weekStart, 'MMM d');
  const endStr = format(weekEnd, 'd, yyyy');
  return `${startStr}–${endStr}`;
}

export function getReservationsForDay(
  reservations: Reservation[],
  day: Date,
  timezone: string
): Reservation[] {
  return reservations.filter((r) => {
    if (r.status === 'CANCELLED') return false;
    try {
      const zonedStart = toZonedTime(new Date(r.startTime), timezone);
      return isSameDay(zonedStart, day);
    } catch {
      return false;
    }
  });
}

export function getSlotTopOffset(startTime: string, timezone: string): number {
  try {
    const date = toZonedTime(new Date(startTime), timezone);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutesFromStart =
      (hours - SLOT_START_HOUR) * 60 + minutes;
    return (totalMinutesFromStart / SLOT_DURATION_MINUTES) * SLOT_HEIGHT;
  } catch {
    return 0;
  }
}

export function getSlotHeight(
  startTime: string,
  endTime: string
): number {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    return Math.max(
      (durationMinutes / SLOT_DURATION_MINUTES) * SLOT_HEIGHT,
      SLOT_HEIGHT / 2
    );
  } catch {
    return SLOT_HEIGHT;
  }
}

export function detectOverlaps(
  reservations: Reservation[]
): Map<string, { index: number; total: number }> {
  const result = new Map<string, { index: number; total: number }>();

  for (let i = 0; i < reservations.length; i++) {
    const overlapping = [reservations[i]];
    for (let j = 0; j < reservations.length; j++) {
      if (i === j) continue;
      try {
        const overlap = areIntervalsOverlapping(
          {
            start: new Date(reservations[i].startTime),
            end: new Date(reservations[i].endTime),
          },
          {
            start: new Date(reservations[j].startTime),
            end: new Date(reservations[j].endTime),
          }
        );
        if (overlap) overlapping.push(reservations[j]);
      } catch {
        // skip
      }
    }
    const idx = overlapping.findIndex((r) => r.id === reservations[i].id);
    result.set(reservations[i].id, { index: idx, total: overlapping.length });
  }

  return result;
}

export function slotDateFromDayAndTime(day: Date, hour: number, minute: number): Date {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function isCurrentWeek(weekStart: Date): boolean {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  return weekStart.toDateString() === currentWeekStart.toDateString();
}
