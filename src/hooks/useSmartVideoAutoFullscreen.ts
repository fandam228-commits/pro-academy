"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface SmartVideoAutoFullscreenOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  autoRotateEnabled?: boolean;
  isPlaying?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface SmartVideoAutoFullscreenReturn {
  isFullscreen: boolean;
  isNativeFullscreen: boolean;
  isCssFullscreen: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  toggleFullscreen: () => Promise<void>;
}

/**
 * Professional Academy — Smart Video Auto Fullscreen Hook
 * 
 * Automatically detects device orientation changes (Portrait <-> Landscape)
 * on mobile/tablet devices and transitions the video player into/out of Fullscreen
 * with zero interruption to playback, time position, or audio.
 * 
 * Supports:
 * - Native Fullscreen API (Android Chrome, Samsung Internet, Firefox, iPadOS, Desktop)
 * - Fallback CSS Viewport-Fill Fullscreen (iOS Safari iPhone, browser restriction bypass)
 * - Manual Fullscreen Toggle
 * - Anti-bounce / Debounced Orientation Handling
 * - Strict Cleanup on Unmount
 */
export function useSmartVideoAutoFullscreen({
  containerRef,
  videoRef,
  enabled = true,
  autoRotateEnabled = true,
  isPlaying = false,
  onFullscreenChange,
}: SmartVideoAutoFullscreenOptions): SmartVideoAutoFullscreenReturn {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track if user explicitly exited fullscreen while staying in landscape
  const userExitedManuallyRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isFullscreen = isNativeFullscreen || isCssFullscreen;

  // Helper to detect mobile/tablet environment
  const detectMobile = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const hasTouch = "ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
    const isSmallScreen = Math.min(window.screen.width, window.screen.height) <= 1024;
    return Boolean(hasTouch && (isMobileUA || isSmallScreen));
  }, []);

  // Helper to detect if device is currently in landscape
  const detectLandscape = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    // 1. Screen Orientation API
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.startsWith("landscape");
    }
    // 2. Legacy window.orientation (90 or -90 deg)
    if (typeof window.orientation !== "undefined") {
      return Math.abs(Number(window.orientation)) === 90;
    }
    // 3. Media Query
    if (window.matchMedia) {
      return window.matchMedia("(orientation: landscape)").matches;
    }
    // 4. Dimensions fallback (only on mobile)
    return window.innerWidth > window.innerHeight;
  }, []);

  // Helper to check if container is currently the native fullscreen element
  const checkNativeFullscreen = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    const doc = document as any;
    const fsElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!fsElement) return false;
    if (!containerRef.current) return true;
    return fsElement === containerRef.current || containerRef.current.contains(fsElement);
  }, [containerRef]);

  // Request Native Fullscreen on Container
  const requestNative = useCallback(async (): Promise<boolean> => {
    const el = containerRef.current as any;
    if (!el) return false;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return true;
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        return true;
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
        return true;
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
        return true;
      }
    } catch (err) {
      // Browser blocked programmatic fullscreen (e.g., user gesture requirement)
      console.warn("[SmartVideoAutoFullscreen] Native requestFullscreen prevented by browser policy:", err);
    }
    return false;
  }, [containerRef]);

  // Exit Native Fullscreen
  const exitNative = useCallback(async (): Promise<boolean> => {
    const doc = document as any;
    try {
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
          return true;
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
          return true;
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
          return true;
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
          return true;
        }
      }
    } catch (err) {
      console.warn("[SmartVideoAutoFullscreen] Error exiting native fullscreen:", err);
    }
    return false;
  }, []);

  // Enter Fullscreen (Tries Native, falls back to CSS Fullscreen gracefully)
  const enterFullscreen = useCallback(async () => {
    userExitedManuallyRef.current = false;

    // Try native fullscreen first
    const nativeSuccess = await requestNative();
    if (nativeSuccess) {
      setIsNativeFullscreen(true);
      setIsCssFullscreen(false);
      onFullscreenChange?.(true);
    } else {
      // Graceful fallback to CSS Fullscreen (works on iOS Safari iPhone, restrictive webviews)
      setIsCssFullscreen(true);
      setIsNativeFullscreen(false);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
      onFullscreenChange?.(true);
    }
  }, [requestNative, onFullscreenChange]);

  // Exit Fullscreen (Exits both Native and CSS Fullscreen)
  const exitFullscreen = useCallback(async () => {
    await exitNative();
    setIsNativeFullscreen(false);
    setIsCssFullscreen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    onFullscreenChange?.(false);
  }, [exitNative, onFullscreenChange]);

  // Toggle Fullscreen (User Tap)
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      userExitedManuallyRef.current = true;
      await exitFullscreen();
    } else {
      userExitedManuallyRef.current = false;
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Sync Initial State
  useEffect(() => {
    setIsMobile(detectMobile());
    setIsLandscape(detectLandscape());
  }, [detectMobile, detectLandscape]);

  // Document Fullscreen Change Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = checkNativeFullscreen();
      setIsNativeFullscreen(isNative);
      if (!isNative && !isCssFullscreen) {
        onFullscreenChange?.(false);
      }
    };

    const doc = document as any;
    doc.addEventListener("fullscreenchange", handleFullscreenChange);
    doc.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    doc.addEventListener("mozfullscreenchange", handleFullscreenChange);
    doc.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      doc.removeEventListener("fullscreenchange", handleFullscreenChange);
      doc.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      doc.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      doc.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [checkNativeFullscreen, isCssFullscreen, onFullscreenChange]);

  // Smart Orientation Listener & Auto-Fullscreen Trigger
  useEffect(() => {
    if (!enabled) return;

    const handleOrientationChange = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const mobile = detectMobile();
        const landscape = detectLandscape();
        setIsMobile(mobile);
        setIsLandscape(landscape);

        // Only auto-trigger on mobile/tablet devices
        if (!mobile || !autoRotateEnabled) return;

        if (landscape) {
          // Device rotated to landscape:
          // If user didn't manually exit during this orientation cycle, enter fullscreen!
          if (!userExitedManuallyRef.current && !checkNativeFullscreen() && !isCssFullscreen) {
            enterFullscreen();
          }
        } else {
          // Device rotated back to portrait:
          // Reset manual exit flag so next landscape turn will trigger again
          userExitedManuallyRef.current = false;
          // Exit fullscreen automatically
          exitFullscreen();
        }
      }, 150);
    };

    // 1. Screen Orientation API
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", handleOrientationChange);
    }

    // 2. Window orientationchange (Safari / older Android)
    window.addEventListener("orientationchange", handleOrientationChange);

    // 3. Media Query Listener (All modern browsers)
    let mql: MediaQueryList | null = null;
    if (window.matchMedia) {
      mql = window.matchMedia("(orientation: landscape)");
      if (mql.addEventListener) {
        mql.addEventListener("change", handleOrientationChange);
      } else if ((mql as any).addListener) {
        (mql as any).addListener(handleOrientationChange);
      }
    }

    // 4. Window resize (Fallback for layout orientation flips)
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", handleOrientationChange);
      }
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (mql) {
        if (mql.removeEventListener) {
          mql.removeEventListener("change", handleOrientationChange);
        } else if ((mql as any).removeListener) {
          (mql as any).removeListener(handleOrientationChange);
        }
      }
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [
    enabled,
    autoRotateEnabled,
    detectMobile,
    detectLandscape,
    checkNativeFullscreen,
    isCssFullscreen,
    enterFullscreen,
    exitFullscreen,
  ]);

  // Clean up body overflow and fullscreen on unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, []);

  return {
    isFullscreen,
    isNativeFullscreen,
    isCssFullscreen,
    isLandscape,
    isMobile,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
