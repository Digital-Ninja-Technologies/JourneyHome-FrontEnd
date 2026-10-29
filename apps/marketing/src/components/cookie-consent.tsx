import * as React from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowLeft, Check } from "lucide-react";
import { Button } from "@journeyhome/ui/components/button";
import { Switch } from "@journeyhome/ui/components/switch";

import {
  COOKIE_CONSENT_STORAGE_KEY,
  OPEN_COOKIE_PREFERENCES_EVENT,
  type CookiePreferences,
  type StoredConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [hasMounted, setHasMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<"banner" | "preferences">("banner");

  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);
  const [marketingEnabled, setMarketingEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (raw) {
        const parsed: StoredConsent = JSON.parse(raw);
        if (parsed?.preferences) {
          setAnalyticsEnabled(Boolean(parsed.preferences.analytics));
          setMarketingEnabled(Boolean(parsed.preferences.marketing));
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
      } else {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
    setHasMounted(true);

    const handleOpen = () => {
      // Reload current preferences from storage if present
      try {
        const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (raw) {
          const parsed: StoredConsent = JSON.parse(raw);
          if (parsed?.preferences) {
            setAnalyticsEnabled(Boolean(parsed.preferences.analytics));
            setMarketingEnabled(Boolean(parsed.preferences.marketing));
          }
        }
      } catch {
        // ignore
      }
      setView("preferences");
      setIsOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpen);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const payload: StoredConsent = {
      consentedAt: new Date().toISOString(),
      preferences: prefs,
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setAnalyticsEnabled(prefs.analytics);
    setMarketingEnabled(prefs.marketing);
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const handleDismissEssential = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    saveConsent({
      necessary: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
  };

  if (!hasMounted || !isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-2xl transition-all duration-200 md:bottom-6 md:p-6"
    >
      {/* Top right close (x) button */}
      <button
        type="button"
        onClick={handleDismissEssential}
        aria-label="Close and accept essential cookies only"
        className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground md:right-4 md:top-4 cursor-pointer"
      >
        <X className="size-4" />
        <span className="sr-only">Close</span>
      </button>

      {view === "banner" ? (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pr-8 md:pr-10">
          <div className="flex-1 pr-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Cookie Consent
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              By clicking &ldquo;Accept All Cookies&rdquo;, you agree to the
              storing of cookies on your device to enhance site navigation,
              analyze site usage, and assist in our marketing efforts.{" "}
              <Link
                to="/privacy"
                className="font-semibold text-link underline underline-offset-4 hover:text-link-hover"
              >
                Privacy policy
              </Link>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 pt-1 md:pt-0">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="rounded-full px-5 text-xs font-bold cursor-pointer"
              onClick={() => setView("preferences")}
            >
              Manage cookies
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-5 text-xs font-bold cursor-pointer"
              onClick={handleAcceptAll}
            >
              Accept all
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pr-8 md:pr-10">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setView("banner")}
              className="flex items-center gap-1.5 text-xs font-semibold text-link transition-colors hover:text-link-hover cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Cookie Preferences
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Choose which cookies you allow us to use. Essential cookies are
            required for basic security and site functionality.
          </p>

          <div className="flex flex-col gap-2.5 py-1">
            {/* Category 1: Strictly Necessary */}
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-canvas p-3">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Strictly Necessary
                  </span>
                  <span className="rounded-full bg-status-active-bg px-2 py-0.5 text-[10px] font-semibold text-status-active">
                    Always Active
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Required for core page navigation, security, and storing your
                  privacy preferences.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-md bg-status-active text-white"
              >
                <Check className="size-3 stroke-3" />
              </div>
            </div>

            {/* Category 2: Analytics & Performance */}
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card p-3">
              <div className="flex-1 pr-2">
                <span className="text-xs font-bold text-foreground">
                  Analytics &amp; Performance
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Allows us to aggregate anonymous visitor metrics and improve
                  our services.
                </p>
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
                label="Toggle analytics cookies"
              />
            </div>

            {/* Category 3: Marketing & Experience */}
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card p-3">
              <div className="flex-1 pr-2">
                <span className="text-xs font-bold text-foreground">
                  Marketing &amp; Experience
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Helps us deliver relevant service updates and personalize your
                  experience.
                </p>
              </div>
              <Switch
                checked={marketingEnabled}
                onCheckedChange={setMarketingEnabled}
                label="Toggle marketing cookies"
              />
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              size="sm"
              variant="default"
              className="rounded-full px-5 text-xs font-bold cursor-pointer"
              onClick={handleSaveCustom}
            >
              Save My Choices
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full px-5 text-xs font-bold cursor-pointer"
              onClick={handleAcceptAll}
            >
              Accept all
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
