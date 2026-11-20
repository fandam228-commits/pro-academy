/**
 * PRO MEDIA COMMAND CENTER (PMC) — Content Calendar API Route
 * Professional Academy — Mr. Habib El Rahman
 * Handles calendar grid generation, scheduling, filtering, rescheduling, and reuse.
 */

import { NextResponse } from "next/server";
import { requirePMCAuth } from "@/lib/media-center/auth";
import {
  generateCalendarGrid,
  filterCalendarItems,
  rescheduleCalendarItem,
  duplicateContentForNewSlot,
  getCurriculumInitialSchedule,
  type CalendarItem,
} from "@/lib/media-center/calendar-engine";

// In-memory runtime calendar item storage
let calendarItemsStore: CalendarItem[] = getCurriculumInitialSchedule();

export async function GET(req: Request) {
  const auth = await requirePMCAuth(req, "analyst");
  if (auth.denied) return auth.denied;

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);

    const platform = searchParams.get("platform") || "all";
    const grade = searchParams.get("grade") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const filtered = filterCalendarItems(calendarItemsStore, {
      platform,
      grade,
      status,
      search,
    });

    const grid = generateCalendarGrid(year, month, filtered);

    return NextResponse.json({
      success: true,
      grid,
      filters: { platform, grade, status, search },
      totalItemsInStore: calendarItemsStore.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load calendar" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // Rescheduling requires Editor or Super Admin authorization
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const { itemId, newDate } = body;

    if (!itemId || !newDate) {
      return NextResponse.json({ error: "Missing itemId or newDate." }, { status: 400 });
    }

    const itemIdx = calendarItemsStore.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) {
      return NextResponse.json({ error: "Calendar item not found." }, { status: 404 });
    }

    const res = rescheduleCalendarItem(calendarItemsStore[itemIdx], newDate);
    calendarItemsStore[itemIdx] = res.item;

    return NextResponse.json({
      success: true,
      message: res.note,
      item: res.item,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to reschedule item." }, { status: 400 });
  }
}

export async function POST(req: Request) {
  // Duplication/Reuse requires Editor or Super Admin authorization
  const auth = await requirePMCAuth(req, "editor");
  if (auth.denied) return auth.denied;

  try {
    const body = await req.json();
    const { sourceItemId, targetDate, targetGrade } = body;

    if (!sourceItemId || !targetDate) {
      return NextResponse.json({ error: "Missing sourceItemId or targetDate." }, { status: 400 });
    }

    const sourceItem = calendarItemsStore.find((i) => i.id === sourceItemId);
    if (!sourceItem) {
      return NextResponse.json({ error: "Source calendar item not found." }, { status: 404 });
    }

    const duplicated = duplicateContentForNewSlot(sourceItem, targetDate, targetGrade);
    calendarItemsStore.unshift(duplicated);

    return NextResponse.json({
      success: true,
      message: "Content duplicated successfully for new calendar slot. Status reset to PENDING for teacher review.",
      item: duplicated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to duplicate item." }, { status: 400 });
  }
}
