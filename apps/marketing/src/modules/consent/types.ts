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
