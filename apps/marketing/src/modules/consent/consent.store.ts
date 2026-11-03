/** biome-ignore-all lint/suspicious/noDocumentCookie: direct cookie management for consent */
import { createStore, useSelector } from "@tanstack/react-store";
import type {
  CookieConsentState,
  CookiePreferences,
  StoredConsent,
} from "./types";

export type {
  CookieConsentState,
  CookiePreferences,
  StoredConsent,
} from "./types";

const STORAGE_KEY = "journey_home_cookie_consent_v1";
const LEGACY_STORAGE_KEY = "journey_home_cookie_consent";
const COOKIE_NAME = "journey_home_cookie_consent";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const ALL_ACCEPTED_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export const cookieConsentStore = createStore<CookieConsentState>({
  hasConsented: false,
  isOpen: false,
  view: "banner",
  preferences: DEFAULT_PREFERENCES,
  isInitialized: false,
});

function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredConsent;
      if (parsed?.version === 1 && parsed?.preferences) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Unable to read cookie consent from localStorage", e);
  }

  // Fallback check on document.cookie
  try {
    if (document.cookie) {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`),
      );
      if (match?.[1]) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded) as StoredConsent;
        if (parsed?.version === 1 && parsed?.preferences) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Unable to read cookie consent from document.cookie", e);
  }

  // Check legacy localStorage key for smooth migration
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "accepted") {
      const migrated: StoredConsent = {
        version: 1,
        consentedAt: new Date().toISOString(),
        preferences: ALL_ACCEPTED_PREFERENCES,
      };
      persistConsent(ALL_ACCEPTED_PREFERENCES);
      return migrated;
    }
    if (legacy === "declined") {
      const migrated: StoredConsent = {
        version: 1,
        consentedAt: new Date().toISOString(),
        preferences: DEFAULT_PREFERENCES,
      };
      persistConsent(DEFAULT_PREFERENCES);
      return migrated;
    }
  } catch {
    // ignore
  }

  return null;
}

function persistConsent(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;

  const payload: StoredConsent = {
    version: 1,
    consentedAt: new Date().toISOString(),
    preferences: {
      necessary: true,
      analytics: !!preferences.analytics,
      marketing: !!preferences.marketing,
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Unable to save cookie consent to localStorage", e);
  }

  try {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  } catch (e) {
    console.warn("Unable to save cookie consent to document.cookie", e);
  }
}

let initTimer: ReturnType<typeof setTimeout> | null = null;
let interactionBufferTimer: ReturnType<typeof setTimeout> | null = null;
let removeInteractionListeners: (() => void) | null = null;

function cleanupDeferredListeners(): void {
  if (removeInteractionListeners) {
    removeInteractionListeners();
    removeInteractionListeners = null;
  }
  if (interactionBufferTimer) {
    clearTimeout(interactionBufferTimer);
    interactionBufferTimer = null;
  }
}

export function initCookieConsent(): () => void {
  if (typeof window === "undefined") return () => {};

  const stored = readStoredConsent();

  if (stored) {
    cookieConsentStore.setState((s) => ({
      ...s,
      hasConsented: true,
      isOpen: false,
      preferences: stored.preferences,
      isInitialized: true,
    }));
    return () => {};
  }

  const showBanner = () => {
    if (initTimer) {
      clearTimeout(initTimer);
      initTimer = null;
    }
    cleanupDeferredListeners();
    cookieConsentStore.setState((s) => {
      if (s.hasConsented || s.isOpen) return s;
      return {
        ...s,
        isOpen: true,
        isInitialized: true,
      };
    });
  };

  const scheduleBanner = () => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => showBanner(), { timeout: 1000 });
    } else {
      showBanner();
    }
  };

  // 1. Defer showing the banner until 3.5s to ensure LCP has completely settled
  if (initTimer) clearTimeout(initTimer);
  initTimer = setTimeout(scheduleBanner, 3500);

  // 2. Or trigger on first user interaction after a 2.5s safe buffer
  cleanupDeferredListeners();
  interactionBufferTimer = setTimeout(() => {
    const handleInteraction = () => {
      cleanupDeferredListeners();
      scheduleBanner();
    };

    window.addEventListener("scroll", handleInteraction, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchstart", handleInteraction, {
      passive: true,
      once: true,
    });
    window.addEventListener("keydown", handleInteraction, {
      passive: true,
      once: true,
    });

    removeInteractionListeners = () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, 2500);

  return () => {
    if (initTimer) {
      clearTimeout(initTimer);
      initTimer = null;
    }
    cleanupDeferredListeners();
  };
}

export function acceptAllCookies(): void {
  persistConsent(ALL_ACCEPTED_PREFERENCES);
  cookieConsentStore.setState((s) => ({
    ...s,
    hasConsented: true,
    isOpen: false,
    preferences: ALL_ACCEPTED_PREFERENCES,
  }));
}

export function declineNonEssentialCookies(): void {
  const nonEssentialDeclined: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
  };
  persistConsent(nonEssentialDeclined);
  cookieConsentStore.setState((s) => ({
    ...s,
    hasConsented: true,
    isOpen: false,
    preferences: nonEssentialDeclined,
  }));
}

export function saveCookiePreferences(
  custom: Partial<CookiePreferences>,
): void {
  const finalPrefs: CookiePreferences = {
    necessary: true,
    analytics: !!custom.analytics,
    marketing: !!custom.marketing,
  };
  persistConsent(finalPrefs);
  cookieConsentStore.setState((s) => ({
    ...s,
    hasConsented: true,
    isOpen: false,
    preferences: finalPrefs,
  }));
}

export function openCookiePreferences(): void {
  if (initTimer) {
    clearTimeout(initTimer);
    initTimer = null;
  }
  cleanupDeferredListeners();
  cookieConsentStore.setState((s) => ({
    ...s,
    isOpen: true,
    view: "preferences",
    isInitialized: true,
  }));
}

export function openCookieBanner(): void {
  if (initTimer) {
    clearTimeout(initTimer);
    initTimer = null;
  }
  cleanupDeferredListeners();
  cookieConsentStore.setState((s) => ({
    ...s,
    isOpen: true,
    view: "banner",
    isInitialized: true,
  }));
}

export function closeCookieBanner(): void {
  cookieConsentStore.setState((s) => ({
    ...s,
    isOpen: false,
  }));
}

export function dismissCookieBanner(): void {
  if (!cookieConsentStore.state.hasConsented) {
    declineNonEssentialCookies();
  } else {
    closeCookieBanner();
  }
}

export function setCookieConsentView(view: "banner" | "preferences"): void {
  cookieConsentStore.setState((s) => ({
    ...s,
    view,
  }));
}

export function useCookieConsentState() {
  return useSelector(cookieConsentStore, (s) => s);
}
