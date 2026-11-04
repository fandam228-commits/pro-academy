"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2, VolumeX, SkipForward, GraduationCap, Sparkles } from "lucide-react";
import { markAcademyIntroSeen, shouldShowAcademyIntro } from "@/lib/academy-intro.mjs";

const INTRO_DURATION_MS = 5600;

function getSessionStorage(): Storage | undefined {
  try { return window.sessionStorage; } catch { return undefined; }
}

export function AcademyIntro() {
  const [visible, setVisible] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const finishIntro = useCallback(() => {
    markAcademyIntroSeen(typeof window === "undefined" ? undefined : getSessionStorage());
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!shouldShowAcademyIntro(getSessionStorage())) return;
    setVisible(true);
    const timeout = window.setTimeout(finishIntro, INTRO_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [finishIntro]);

  const playBrandChime = () => {
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) return;
      const context = new AudioContextConstructor();
      const notes = [261.63, 329.63, 392, 523.25];
      const startAt = context.currentTime + 0.04;

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = startAt + index * 0.19;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.075, noteStart + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.48);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.5);
      });
      window.setTimeout(() => void context.close(), 1500);
      setSoundPlayed(true);
    } catch {
      // Sound is optional; unsupported audio must not affect navigation.
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Professional Academy welcome"
      className="academy-intro fixed inset-0 z-[9999] flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#071329] px-5 py-10 text-white"
    >
      <div aria-hidden="true" className="academy-intro-grid pointer-events-none absolute inset-0 opacity-30" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-blue-600/30 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/15 blur-[110px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-7 text-center sm:gap-9">
        <div className="academy-intro-mark relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-amber-300/40 bg-gradient-to-br from-blue-500/30 to-indigo-950 shadow-[0_0_70px_rgba(245,190,70,.16)] sm:h-28 sm:w-28">
          <div className="absolute inset-2 rounded-[1.45rem] border border-white/10" />
          <GraduationCap className="h-12 w-12 text-amber-300 sm:h-14 sm:w-14" strokeWidth={1.5} />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-200" />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-extrabold tracking-[0.38em] text-amber-200 sm:text-xs">WELCOME TO</p>
          <h1 className="text-3xl font-black tracking-[0.08em] text-white drop-shadow sm:text-5xl md:text-6xl">
            PROFESSIONAL
            <span className="mt-1 block bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-2xl tracking-[0.24em] text-transparent sm:text-3xl md:text-4xl">
              ACADEMY
            </span>
          </h1>
          <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-amber-300/70 bg-slate-800 p-1 shadow-[0_0_35px_rgba(245,190,70,.2)] sm:h-28 sm:w-28">
            <img
              src="/habib-hero.jpg"
              alt="Mr. Habib El Rahman"
              className="h-full w-full rounded-full object-cover object-top"
              onError={(event) => { event.currentTarget.style.opacity = "0"; }}
            />
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs font-semibold text-blue-200/80">YOUR ENGLISH LEARNING JOURNEY</p>
            <p className="mt-1 text-xl font-black text-white sm:text-2xl">Mr. Habib El Rahman</p>
            <p className="mt-2 text-sm font-bold tracking-[0.18em] text-amber-300">LIMITLESS INNOVATION</p>
          </div>
        </div>

        <p className="max-w-xl text-sm font-medium text-blue-100/80 sm:text-base">
          Your Future Starts Here. <span className="text-amber-200">Learn • Practice • Achieve</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={playBrandChime}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:border-amber-300/60 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label={soundPlayed ? "Play welcome sound again" : "Play optional welcome sound"}
          >
            {soundPlayed ? <VolumeX className="h-4 w-4 text-amber-200" /> : <Volume2 className="h-4 w-4 text-amber-200" />}
            {soundPlayed ? "تشغيل اللحن مرة أخرى" : "تشغيل المؤثر الصوتي"}
          </button>
          <button
            type="button"
            onClick={finishIntro}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-950/30 transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white"
          >
            تخطي المقدمة
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
        <div className="academy-intro-progress h-full bg-gradient-to-r from-amber-200 to-yellow-500" />
      </div>

      <style jsx>{`
        .academy-intro-grid {
          background-image: linear-gradient(rgba(148, 163, 184, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, .08) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }
        .academy-intro-mark { animation: academy-mark-in .8s cubic-bezier(.2,.8,.2,1) both; }
        .academy-intro-progress { animation: academy-progress ${INTRO_DURATION_MS}ms linear forwards; }
        @keyframes academy-mark-in { from { opacity: 0; transform: translateY(18px) scale(.86); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes academy-progress { from { width: 0; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .academy-intro-mark, .academy-intro-progress { animation: none; }
        }
      `}</style>
    </div>
  );
}
