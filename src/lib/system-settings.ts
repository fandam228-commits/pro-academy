import fs from "fs";
import path from "path";

export interface FreeCoursesSettings {
  isFreeUntilEndOfTerm: boolean;
  freeCoursesAccessUntil: string | null; // e.g. "2027-01-31" or ISO string, or null
  labelAr: string;
  labelEn: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: FreeCoursesSettings = {
  isFreeUntilEndOfTerm: true,
  freeCoursesAccessUntil: null, // null means "مجانا حتى نهاية الترم" without an arbitrary day invented
  labelAr: "مجانا حتى نهاية الترم",
  labelEn: "FREE UNTIL THE END OF THE TERM",
  updatedAt: new Date().toISOString(),
};

// Global in-memory cache for fast lookup and serverless instance persistence
const globalSettings = globalThis as typeof globalThis & {
  __paSystemSettings?: FreeCoursesSettings;
};

// Safe file-based fallback persistence so changes persist across restarts
const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "src/config/system-settings.json");

function loadSettingsFromDisk(): FreeCoursesSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        labelAr: "مجانا حتى نهاية الترم",
        labelEn: "FREE UNTIL THE END OF THE TERM",
      };
    }
  } catch (e) {
    console.warn("Failed to read system-settings.json, using defaults:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettingsToDisk(settings: FreeCoursesSettings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf8");
  } catch (e) {
    console.warn("Failed to persist system-settings.json to disk:", e);
  }
}

export function getFreeCoursesSettings(): FreeCoursesSettings {
  if (!globalSettings.__paSystemSettings) {
    globalSettings.__paSystemSettings = loadSettingsFromDisk();
  }
  return globalSettings.__paSystemSettings;
}

export function updateFreeCoursesSettings(
  updates: Partial<Pick<FreeCoursesSettings, "isFreeUntilEndOfTerm" | "freeCoursesAccessUntil">>
): FreeCoursesSettings {
  const current = getFreeCoursesSettings();
  const next: FreeCoursesSettings = {
    ...current,
    ...updates,
    labelAr: "مجانا حتى نهاية الترم",
    labelEn: "FREE UNTIL THE END OF THE TERM",
    updatedAt: new Date().toISOString(),
  };

  globalSettings.__paSystemSettings = next;
  saveSettingsToDisk(next);
  return next;
}

export function isFreeCourseAccessActive(): boolean {
  const settings = getFreeCoursesSettings();
  if (!settings.isFreeUntilEndOfTerm) {
    return false;
  }
  if (!settings.freeCoursesAccessUntil) {
    // No expiration date set = active until the end of term
    return true;
  }
  const expiry = new Date(settings.freeCoursesAccessUntil).getTime();
  return Date.now() <= expiry;
}
