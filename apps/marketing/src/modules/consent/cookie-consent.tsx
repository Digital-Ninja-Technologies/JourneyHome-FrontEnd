import { Button } from "@journeyhome/ui/components/button";
import { Switch } from "@journeyhome/ui/components/switch";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, X } from "lucide-react";
import * as React from "react";
import {
  acceptAllCookies,
  dismissCookieBanner,
  openCookieBanner,
  openCookiePreferences,
  saveCookiePreferences,
  useCookieConsentState,
} from "./consent.store";

export function CookieConsent() {
  const { isOpen, view, preferences, isInitialized } = useCookieConsentState();

  const [localAnalytics, setLocalAnalytics] = React.useState(
    preferences.analytics,
  );
  const [localMarketing, setLocalMarketing] = React.useState(
    preferences.marketing,
  );
  const [isRendered, setIsRendered] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        setIsRendered(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    setIsRendered(false);
  }, [isOpen]);

  React.useEffect(() => {
    setLocalAnalytics(preferences.analytics);
    setLocalMarketing(preferences.marketing);
  }, [preferences]);

  if (!isInitialized || !isOpen) {
    return null;
  }

  const handleSavePreferences = () => {
    saveCookiePreferences({
      necessary: true,
      analytics: localAnalytics,
      marketing: localMarketing,
    });
  };

  return (
    <aside
      aria-label="Cookie consent banner"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 p-3 transform-gpu transition-all duration-300 ease-out sm:bottom-6 sm:left-6 sm:right-auto sm:w-full sm:max-w-md sm:p-0",
        isRendered
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        {/* Top ambient highlight line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/30 to-transparent"
        />

        {view === "banner" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Cookie preferences
              </h3>
              <button
                type="button"
                onClick={dismissCookieBanner}
                aria-label="Close cookie consent banner"
                className="-mr-2 -mt-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              We use cookies to keep you signed in, remember your preferences,
              and improve your experience. Read our{" "}
              <Link
                to="/privacy"
                className="font-medium text-link underline underline-offset-4 hover:text-link-hover"
              >
                Privacy policy
              </Link>{" "}
              for details.
            </p>

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCookiePreferences}
                className="rounded-full px-5 text-xs font-bold cursor-pointer"
              >
                Manage
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={acceptAllCookies}
                className="rounded-full px-5 text-xs font-bold cursor-pointer"
              >
                Accept all
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={openCookieBanner}
                  className="-ml-2 mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  Back
                </button>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Manage preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={dismissCookieBanner}
                aria-label="Close cookie consent banner"
                className="-mr-2 -mt-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Essential cookies are required for basic security and site
              functionality. Optional cookies help us improve our services and
              communications.
            </p>

            <div className="mt-1 space-y-4 divide-y divide-border/40">
              {/* Category 1: Strictly Necessary */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="text-sm font-semibold text-foreground">
                    Strictly necessary
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Required for core navigation, security, and storing your
                    cookie preferences.
                  </p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full border border-status-active/20 bg-status-active-bg px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-status-active">
                  Always active
                </span>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="flex items-start justify-between gap-4 pt-4">
                <div className="space-y-1 pr-2">
                  <label
                    htmlFor="consent-analytics"
                    className="cursor-pointer text-sm font-semibold text-foreground"
                  >
                    Analytics &amp; Performance
                  </label>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Allows us to aggregate anonymous visitor metrics and improve
                    our services.
                  </p>
                </div>
                <Switch
                  checked={localAnalytics}
                  onCheckedChange={setLocalAnalytics}
                  label="Toggle analytics cookies"
                  className="mt-0.5 shrink-0"
                />
              </div>

              {/* Category 3: Marketing & Experience */}
              <div className="flex items-start justify-between gap-4 pt-4">
                <div className="space-y-1 pr-2">
                  <label
                    htmlFor="consent-marketing"
                    className="cursor-pointer text-sm font-semibold text-foreground"
                  >
                    Marketing &amp; Experience
                  </label>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Helps us deliver relevant service updates and personalize
                    your experience.
                  </p>
                </div>
                <Switch
                  checked={localMarketing}
                  onCheckedChange={setLocalMarketing}
                  label="Toggle marketing cookies"
                  className="mt-0.5 shrink-0"
                />
              </div>
            </div>

            <div className="mt-2 flex flex-col-reverse gap-2 border-t border-border/40 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSavePreferences}
                className="rounded-full px-5 text-xs font-bold cursor-pointer"
              >
                Save preferences
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={acceptAllCookies}
                className="rounded-full px-5 text-xs font-bold cursor-pointer"
              >
                Accept all
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CookieConsent;
