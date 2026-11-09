"use client";

/**
 * Professional Pronunciation Assistant Engine
 * Handles Web SpeechSynthesis API with strict device voice detection,
 * non-overlapping audio guarantees, British/American accent management,
 * hover debouncing, speed control, sentence breakdown, and paragraph tracking.
 */

export type PronunciationAccent = "uk" | "us";
export type PronunciationSpeed = "normal" | "slow";

export interface VoiceStatus {
  hasUkVoice: boolean;
  hasUsVoice: boolean;
  ukVoiceName: string | null;
  usVoiceName: string | null;
  activeVoiceName: string | null;
  isFallback: boolean;
  fallbackNotice: string | null;
}

export interface PronunciationOptions {
  accent?: PronunciationAccent;
  speed?: PronunciationSpeed;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onSentenceChange?: (sentenceIndex: number) => void;
}

class PronunciationManager {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private hoverTimer: any = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    try {
      this.voices = window.speechSynthesis.getVoices() || [];
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    } catch {
      this.voices = [];
    }
    return this.voices;
  }

  public getVoiceStatus(targetAccent: PronunciationAccent = "uk"): VoiceStatus {
    const voices = this.voices.length > 0 ? this.voices : this.loadVoices();

    const ukVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().replace("_", "-") === "en-gb" ||
        v.lang.toLowerCase().startsWith("en-gb") ||
        v.name.toLowerCase().includes("united kingdom") ||
        v.name.toLowerCase().includes("british") ||
        v.name.toLowerCase().includes("uk english")
    );

    const usVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().replace("_", "-") === "en-us" ||
        v.lang.toLowerCase().startsWith("en-us") ||
        v.name.toLowerCase().includes("united states") ||
        v.name.toLowerCase().includes("us english")
    );

    const targetVoice = targetAccent === "uk" ? ukVoice : usVoice;

    let isFallback = false;
    let fallbackNotice: string | null = null;
    let activeVoiceName: string | null = targetVoice?.name || null;

    if (!targetVoice) {
      // Find generic English voice
      const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (anyEn) {
        isFallback = true;
        activeVoiceName = anyEn.name;
        fallbackNotice =
          targetAccent === "uk"
            ? "الصوت البريطاني (en-GB) غير مثبت في متصفحك. تم استخدام الصوت الإنجليزي البديل المتاح."
            : "الصوت الأمريكي (en-US) غير مثبت في متصفحك. تم استخدام الصوت الإنجليزي البديل المتاح.";
      } else {
        isFallback = true;
        activeVoiceName = voices[0]?.name || "صوت الجهاز الافتراضي";
        fallbackNotice = "لم يتم العثور على صوت إنجليزي مخصص على هذا الجهاز. تم استخدام صوت النظام الافتراضي.";
      }
    }

    return {
      hasUkVoice: !!ukVoice,
      hasUsVoice: !!usVoice,
      ukVoiceName: ukVoice?.name || null,
      usVoiceName: usVoice?.name || null,
      activeVoiceName,
      isFallback,
      fallbackNotice,
    };
  }

  /**
   * Stop any current speech playback immediately
   */
  public stop(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
  }

  public pause(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resume(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Speak an individual word or phrase
   */
  public speak(
    text: string,
    options: PronunciationOptions = {}
  ): void {
    const cleanText = (text || "").trim();
    if (!cleanText) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      options.onError?.(new Error("SpeechSynthesis is not supported on this device/browser."));
      return;
    }

    // Single-playback guarantee: Always stop previous speech
    this.stop();

    const accent = options.accent || "uk";
    const speed = options.speed || "normal";

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Rate: Normal is 0.9 (natural clarity), Slow is 0.65 (pedagogical drill)
    utterance.rate = speed === "slow" ? 0.65 : 0.9;
    utterance.pitch = 1.0;

    // Resolve voice
    const voices = this.voices.length > 0 ? this.voices : this.loadVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (accent === "uk") {
      utterance.lang = "en-GB";
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === "en-gb" ||
          v.lang.toLowerCase().startsWith("en-gb") ||
          v.name.toLowerCase().includes("united kingdom") ||
          v.name.toLowerCase().includes("british") ||
          v.name.toLowerCase().includes("uk english")
      );
    } else {
      utterance.lang = "en-US";
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === "en-us" ||
          v.lang.toLowerCase().startsWith("en-us") ||
          v.name.toLowerCase().includes("united states") ||
          v.name.toLowerCase().includes("us english")
      );
    }

    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      // 'interrupted' or 'canceled' are normal lifecycle events on stop()
      if (e.error !== "interrupted" && e.error !== "canceled") {
        options.onError?.(e);
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Hover-debounced word speech for Desktop
   * Prevents rapid mouse sweeps from queuing multiple audios.
   */
  public speakOnHover(
    word: string,
    options: PronunciationOptions = {},
    debounceMs: number = 220
  ): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    this.hoverTimer = setTimeout(() => {
      this.speak(word, options);
    }, debounceMs);
  }

  public cancelHover(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  /**
   * Speaks a paragraph with real-time sentence tracking and highlighting callback
   */
  public speakParagraph(
    fullText: string,
    options: PronunciationOptions & {
      sentences?: string[];
      onSentenceIndexChange?: (index: number) => void;
    } = {}
  ): void {
    const rawSentences =
      options.sentences && options.sentences.length > 0
        ? options.sentences
        : splitIntoSentences(fullText);

    if (rawSentences.length === 0) return;

    this.stop();

    let currentIndex = 0;

    const playNextSentence = () => {
      if (currentIndex >= rawSentences.length) {
        options.onEnd?.();
        return;
      }

      options.onSentenceIndexChange?.(currentIndex);

      this.speak(rawSentences[currentIndex], {
        accent: options.accent,
        speed: options.speed,
        onStart: options.onStart,
        onEnd: () => {
          currentIndex++;
          playNextSentence();
        },
        onError: (err) => {
          options.onError?.(err);
        },
      });
    };

    playNextSentence();
  }
}

/**
 * Splits text into natural English sentences preserving punctuation
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Split on sentence-ending punctuation followed by space or end
  const matches = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!matches) return [text.trim()];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0);
}

// Global singleton instance for single audio queue across all components
export const pronunciationManager = new PronunciationManager();
