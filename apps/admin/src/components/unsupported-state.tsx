import { UNSUPPORTED_MESSAGE } from "@/lib/api";

/** Shown on off-spec screens when the real API doesn't have the endpoint yet. */
export function UnsupportedState({
  endpoint,
  children,
}: {
  endpoint: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-foreground/30 p-8">
      <div className="font-serif text-2xl">Not available yet</div>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {UNSUPPORTED_MESSAGE} {children} It needs <code>{endpoint}</code>.
      </p>
    </section>
  );
}
