/** biome-ignore-all lint/suspicious/noDocumentCookie: <explanation> */
import { createStore, useSelector } from "@tanstack/react-store";

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent {
  version: 1;
  consentedAt: string;
  preferences: CookiePreferences;
}

export interface CookieConsentState {
  hasConsented: boolean;
  isOpen: boolean;
  view: "banner" | "preferences";
  preferences: CookiePreferences;
  isInitialized: boolean;
}

const STORAGE_KEY = "journey_home_cookie_consent_v1";
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
      if (parsed?.preferences) {
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
        new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
      );
      if (match?.[1]) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded) as StoredConsent;
        if (parsed?.preferences) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Unable to read cookie consent from document.cookie", e);
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

  // User has not consented yet: show banner after a gentle delay for smooth entrance
  if (initTimer) clearTimeout(initTimer);
  initTimer = setTimeout(() => {
    cookieConsentStore.setState((s) => ({
      ...s,
      isOpen: true,
      isInitialized: true,
    }));
  }, 600);

  return () => {
    if (initTimer) clearTimeout(initTimer);
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
  custom: Partial<CookiePreferences>
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
  cookieConsentStore.setState((s) => ({
    ...s,
    isOpen: true,
    view: "preferences",
  }));
}

export function openCookieBanner(): void {
  cookieConsentStore.setState((s) => ({
    ...s,
    isOpen: true,
    view: "banner",
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
