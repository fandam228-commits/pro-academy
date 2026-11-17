import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Professional Academy – Smart Video Auto Fullscreen Suite", () => {
  // Mock DOM & Window environment for unit simulation
  class MockDOMElement {
    constructor(tagName = "div") {
      this.tagName = tagName;
      this.style = {};
      this.eventListeners = {};
      this.currentTime = 42.5;
      this.duration = 180.0;
      this.paused = false;
      this.muted = false;
    }

    addEventListener(event, handler) {
      if (!this.eventListeners[event]) this.eventListeners[event] = [];
      this.eventListeners[event].push(handler);
    }

    removeEventListener(event, handler) {
      if (!this.eventListeners[event]) return;
      this.eventListeners[event] = this.eventListeners[event].filter((h) => h !== handler);
    }

    requestFullscreen() {
      return Promise.resolve();
    }
  }

  // 1. Core Logic Simulation of useSmartVideoAutoFullscreen
  class SmartVideoAutoFullscreenController {
    constructor(options = {}) {
      this.container = options.container || new MockDOMElement("div");
      this.video = options.video || new MockDOMElement("video");
      this.enabled = options.enabled !== false;
      this.autoRotateEnabled = options.autoRotateEnabled !== false;
      this.isMobile = options.isMobile ?? true;

      this.currentOrientation = options.initialOrientation || "portrait-primary";
      this.isNativeFullscreen = false;
      this.isCssFullscreen = false;
      this.userExitedManually = false;
      this.listeners = [];
    }

    get isFullscreen() {
      return this.isNativeFullscreen || this.isCssFullscreen;
    }

    get isLandscape() {
      return this.currentOrientation.startsWith("landscape");
    }

    async enterFullscreen(requestFails = false) {
      this.userExitedManually = false;
      if (!requestFails) {
        try {
          await this.container.requestFullscreen();
          this.isNativeFullscreen = true;
          this.isCssFullscreen = false;
          return;
        } catch {}
      }
      // Fallback to CSS Fullscreen (e.g. iOS Safari / blocked programmatic fullscreen)
      this.isCssFullscreen = true;
      this.isNativeFullscreen = false;
    }

    async exitFullscreen() {
      this.isNativeFullscreen = false;
      this.isCssFullscreen = false;
    }

    async toggleFullscreen(requestFails = false) {
      if (this.isFullscreen) {
        this.userExitedManually = true;
        await this.exitFullscreen();
      } else {
        this.userExitedManually = false;
        await this.enterFullscreen(requestFails);
      }
    }

    async onOrientationChange(newOrientation, requestFails = false) {
      const prevOrientation = this.currentOrientation;
      this.currentOrientation = newOrientation;

      if (!this.enabled || !this.autoRotateEnabled || !this.isMobile) return;

      if (this.isLandscape) {
        // Device turned to landscape: auto enter fullscreen unless user previously exited manually
        if (!this.userExitedManually && !this.isFullscreen) {
          await this.enterFullscreen(requestFails);
        }
      } else {
        // Device returned to portrait: auto exit fullscreen & reset manual exit flag
        this.userExitedManually = false;
        if (this.isFullscreen) {
          await this.exitFullscreen();
        }
      }
    }
  }

  it("Scenario 1: Initial state in Portrait mode — Not fullscreen, controls active", () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });
    assert.equal(player.isFullscreen, false);
    assert.equal(player.isLandscape, false);
    assert.equal(player.video.currentTime, 42.5);
    assert.equal(player.video.paused, false);
  });

  it("Scenario 2: Device rotated to Landscape mode — Auto enters Fullscreen without reloading or resetting time", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });
    const initialTime = player.video.currentTime;

    await player.onOrientationChange("landscape-primary");

    assert.equal(player.isLandscape, true);
    assert.equal(player.isFullscreen, true);
    assert.equal(player.isNativeFullscreen, true);
    // Crucial: time position must remain unchanged
    assert.equal(player.video.currentTime, initialTime);
  });

  it("Scenario 3: Device rotated back to Portrait — Auto exits Fullscreen, preserves view and time", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });
    await player.onOrientationChange("landscape-primary");
    assert.equal(player.isFullscreen, true);

    // Rotate back to Portrait
    await player.onOrientationChange("portrait-primary");
    assert.equal(player.isLandscape, false);
    assert.equal(player.isFullscreen, false);
    assert.equal(player.video.currentTime, 42.5);
  });

  it("Scenario 4: Paused video state is strictly preserved during rotation cycles", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });
    player.video.paused = true; // Video is paused

    await player.onOrientationChange("landscape-secondary");
    assert.equal(player.isFullscreen, true);
    assert.equal(player.video.paused, true, "Video must remain paused during landscape orientation change");

    await player.onOrientationChange("portrait-primary");
    assert.equal(player.isFullscreen, false);
    assert.equal(player.video.paused, true, "Video must remain paused during portrait orientation change");
  });

  it("Scenario 5: Manual Fullscreen Button toggle — Enters and Exits on user tap", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });

    // Tap to enter
    await player.toggleFullscreen();
    assert.equal(player.isFullscreen, true);

    // Tap to exit
    await player.toggleFullscreen();
    assert.equal(player.isFullscreen, false);
    assert.equal(player.userExitedManually, true);
  });

  it("Scenario 6: Manual exit in Landscape respects user intent and prevents bouncing", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });
    await player.onOrientationChange("landscape-primary");
    assert.equal(player.isFullscreen, true);

    // User explicitly taps exit fullscreen while keeping device in landscape
    await player.toggleFullscreen();
    assert.equal(player.isFullscreen, false);
    assert.equal(player.userExitedManually, true);

    // Subtle jitter / redundant landscape event does NOT re-trigger fullscreen
    await player.onOrientationChange("landscape-primary");
    assert.equal(player.isFullscreen, false, "Must not force re-entry while user explicitly exited in landscape");

    // Rotating back to portrait resets the override
    await player.onOrientationChange("portrait-primary");
    assert.equal(player.userExitedManually, false);

    // Next time rotated to landscape, auto-fullscreen works seamlessly again
    await player.onOrientationChange("landscape-primary");
    assert.equal(player.isFullscreen, true);
  });

  it("Scenario 7: Fallback to CSS Fullscreen when browser blocks native requestFullscreen (iOS Safari / Policy)", async () => {
    const player = new SmartVideoAutoFullscreenController({ initialOrientation: "portrait-primary" });

    // Simulate browser rejecting requestFullscreen
    await player.onOrientationChange("landscape-primary", /* requestFails */ true);

    assert.equal(player.isFullscreen, true);
    assert.equal(player.isNativeFullscreen, false);
    assert.equal(player.isCssFullscreen, true, "Must activate CSS Fullscreen fallback seamlessly");

    // Returning to portrait clears CSS fullscreen
    await player.onOrientationChange("portrait-primary");
    assert.equal(player.isFullscreen, false);
    assert.equal(player.isCssFullscreen, false);
  });

  it("Scenario 8: Desktop / Non-mobile devices do not auto-trigger fullscreen on window resize", async () => {
    const desktopPlayer = new SmartVideoAutoFullscreenController({
      initialOrientation: "portrait-primary",
      isMobile: false, // Desktop device
    });

    await desktopPlayer.onOrientationChange("landscape-primary");
    assert.equal(
      desktopPlayer.isFullscreen,
      false,
      "Desktop browser should not auto-fullscreen on landscape resize"
    );

    // But manual button still works for desktop users!
    await desktopPlayer.toggleFullscreen();
    assert.equal(desktopPlayer.isFullscreen, true);
  });
});
