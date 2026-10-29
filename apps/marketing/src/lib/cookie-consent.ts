export const COOKIE_CONSENT_STORAGE_KEY = "journey_home_cookie_consent_v1";
export const OPEN_COOKIE_PREFERENCES_EVENT =
  "journeyhome:open-cookie-preferences";

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent {
  consentedAt: string;
  preferences: CookiePreferences;
}

export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
  }
}
