const INTRO_SEEN_KEY = "pa_intro_seen_v1";

export function shouldShowAcademyIntro(storage) {
  try {
    return storage?.getItem(INTRO_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markAcademyIntroSeen(storage) {
  try {
    storage?.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage may be disabled; the intro must never block access to the platform.
  }
}
