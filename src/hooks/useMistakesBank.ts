"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchMistakes,
  resolveMistake,
  recordMistake,
  UserMistakeItem,
  MistakesStats,
  QuestionSnapshot,
} from "@/lib/mistakes-service";
import { useApp } from "@/context/AppContext";

export function useMistakesBank() {
  const { user } = useApp();
  const userId = user?.id || "usr_student_1";

  const [unresolvedMistakes, setUnresolvedMistakes] = useState<UserMistakeItem[]>([]);
  const [masteredMistakes, setMasteredMistakes] = useState<UserMistakeItem[]>([]);
  const [stats, setStats] = useState<MistakesStats>({
    totalUnresolved: 0,
    totalMastered: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch unresolved items
      const unresolvedRes = await fetchMistakes({
        userId,
        status: "unresolved",
        category: selectedCategory === "الكل" ? undefined : selectedCategory,
      });

      // Fetch mastered items
      const masteredRes = await fetchMistakes({
        userId,
        status: "mastered",
        category: selectedCategory === "الكل" ? undefined : selectedCategory,
        limit: 50,
      });

      if (unresolvedRes.success) {
        setUnresolvedMistakes(unresolvedRes.mistakes);
        setStats(unresolvedRes.stats);
      }
      if (masteredRes.success) {
        setMasteredMistakes(masteredRes.mistakes);
      }
    } catch (e) {
      console.error("useMistakesBank loadData error:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Optimistic resolution: immediately update UI, then send API call
  const resolveQuestion = useCallback(
    async (questionId: string) => {
      const target = unresolvedMistakes.find((m) => m.questionId === questionId);
      if (!target) return false;

      // 1. Optimistic state updates
      const updatedTarget: UserMistakeItem = {
        ...target,
        status: "mastered",
        updatedAt: new Date().toISOString(),
      };

      setUnresolvedMistakes((prev) => prev.filter((m) => m.questionId !== questionId));
      setMasteredMistakes((prev) => [updatedTarget, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalUnresolved: Math.max(0, prev.totalUnresolved - 1),
        totalMastered: prev.totalMastered + 1,
      }));

      // 2. Persist to API
      try {
        const res = await resolveMistake(questionId, userId);
        if (!res.success) {
          console.warn("Resolve failed on server, reloading:", res.error);
          loadData();
          return false;
        }
        return true;
      } catch (err) {
        console.error("resolveQuestion server error:", err);
        loadData();
        return false;
      }
    },
    [unresolvedMistakes, userId, loadData]
  );

  // Optimistic record: increment mistake count or add to unresolved
  const recordWrong = useCallback(
    async (question: QuestionSnapshot, wrongAnswer: string) => {
      const qId = String(question.id);

      // Optimistic update
      setUnresolvedMistakes((prev) => {
        const idx = prev.findIndex((m) => m.questionId === qId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            mistakeCount: updated[idx].mistakeCount + 1,
            wrongAnswer,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          const newItem: UserMistakeItem = {
            id: `temp_${Date.now()}`,
            userId,
            questionId: qId,
            questionSnapshot: question,
            wrongAnswer,
            mistakeCount: 1,
            status: "unresolved",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [newItem, ...prev];
        }
      });

      setStats((prev) => ({
        ...prev,
        totalUnresolved: prev.totalUnresolved + 1,
        total: prev.total + 1,
      }));

      try {
        await recordMistake(question, wrongAnswer, userId);
      } catch (err) {
        console.error("recordWrong server error:", err);
      }
    },
    [userId]
  );

  return {
    unresolvedMistakes,
    masteredMistakes,
    stats,
    loading,
    selectedCategory,
    setSelectedCategory,
    reloadMistakes: loadData,
    resolveQuestion,
    recordWrong,
  };
}
