"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  fetchGamificationProfile,
  awardXP,
  subscribeGamificationToast,
  GamificationProfile,
  GamificationToastEvent,
} from "@/lib/gamification-service";

export function useGamification() {
  const { user } = useApp();
  const userId = user?.id || "usr_student_1";

  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeToast, setActiveToast] = useState<GamificationToastEvent | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetchGamificationProfile(userId);
      if (res.success && res.profile) {
        setProfile(res.profile);
      }
    } catch (e) {
      console.error("useGamification loadProfile error:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Subscribe to XP toast celebration events
  useEffect(() => {
    const unsubscribe = subscribeGamificationToast((event) => {
      setActiveToast(event);
      // Optimistically update profile in real time
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalXp: prev.totalXp + event.xp,
          weeklyXp: prev.weeklyXp + event.xp,
          currentStreak: event.streak !== undefined ? event.streak : prev.currentStreak,
        };
      });

      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4500);

      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const triggerXP = useCallback(
    async (
      actionType: "quiz_correct" | "quiz_bonus_90" | "mistake_resolved" | "translation_exercise" | "story_lesson",
      referenceId?: string,
      bonusXp?: number
    ) => {
      await awardXP({
        actionType,
        referenceId,
        bonusXp,
        userId,
      });
    },
    [userId]
  );

  return {
    profile,
    loading,
    activeToast,
    refreshProfile: loadProfile,
    triggerXP,
    dismissToast: () => setActiveToast(null),
  };
}
