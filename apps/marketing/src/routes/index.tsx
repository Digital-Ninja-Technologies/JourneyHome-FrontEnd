import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-20 text-center md:px-20">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
        Save ahead. Prepare with dignity.
      </h1>
      <p className="mt-4 text-lg text-muted">
        Journey Home marketing site running on TanStack Start (Stage 1 scaffold).
      </p>
    </main>
  );
}
