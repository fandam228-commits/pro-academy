"use client";

import React from "react";

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
      >
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3" />
        </div>
        <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    ))}
  </div>
);
