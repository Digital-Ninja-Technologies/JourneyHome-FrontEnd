import { PageHeader } from "../components/ui";

/** Screens in the design whose data the backend doesn't expose to admins yet. */
export default function Unavailable({ title, needs }: { title: string; needs: string }) {
  return (
    <main className="flex max-w-[720px] flex-col gap-6 p-10">
      <PageHeader title={title} />
      <section className="rounded-3xl border border-dashed border-foreground/30 p-8">
        <div className="font-serif text-2xl">Not available yet</div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The backend doesn&rsquo;t expose this to admins yet. It needs {needs}. Once that exists, this screen can be wired up.
        </p>
      </section>
    </main>
  );
}
