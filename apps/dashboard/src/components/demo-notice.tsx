import { USE_MOCKS } from "../lib/api";

/** Shown only in demo mode, on screens whose server endpoints are simulated. */
export function DemoNotice({ children }: { children?: React.ReactNode }) {
  if (!USE_MOCKS) return null;
  return (
    <p className="rounded-xl border border-dashed border-link/40 bg-cream/60 px-3.5 py-2 text-xs leading-relaxed text-status-due">
      <strong>Demo mode</strong> — this screen talks to a simulated server.{" "}
      {children}
    </p>
  );
}
