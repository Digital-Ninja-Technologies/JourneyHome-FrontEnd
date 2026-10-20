import { DEMO_ACCOUNTS, resetDemoData } from "@journeyhome/mock-api";
import { USE_MOCKS } from "../lib/api";

/** Demo-mode helper under the sign-in form: sample credentials, one-click fill, and a reset. */
export function DemoLogin() {
  if (!USE_MOCKS) return null;
  const acct = DEMO_ACCOUNTS.customer;
  function fill() {
    for (const [id, value] of [["email", acct.email], ["password", acct.password]]) {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = value;
    }
  }
  function reset() {
    if (!window.confirm("Reset all demo data and sign out?")) return;
    resetDemoData();
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.reload();
  }
  return (
    <div className="rounded-2xl border border-dashed border-link/40 bg-cream/60 px-4 py-3 text-xs leading-relaxed text-status-due">
      <strong>Demo mode</strong> — no backend needed. Sample account: <code>{acct.email}</code> / <code>{acct.password}</code>.
      <div className="mt-1.5 flex gap-4 font-semibold underline">
        <button type="button" onClick={fill}>Fill in</button>
        <button type="button" onClick={reset}>Reset demo data</button>
      </div>
    </div>
  );
}
