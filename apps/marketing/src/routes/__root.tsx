/// <reference types="vite/client" />
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import globalsCss from "../styles/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Journey Home — Save ahead. Prepare with dignity." },
      {
        name: "description",
        content: "Families save a little each month toward professional photography and videography for a loved one's burial.",
      },
    ],
    links: [
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: globalsCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </RootDocument>
  );
}

function NotFoundComponent() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex items-center gap-5">
        <h1 className="border-r border-foreground/30 pr-5 text-2xl font-medium leading-[49px]">
          404
        </h1>
        <h2 className="m-0 text-sm font-normal leading-[49px]">
          This page could not be found.
        </h2>
      </div>
    </main>
  );
}

function ErrorComponent({ error }: { error: unknown }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex items-center gap-5">
        <h1 className="border-r border-foreground/30 pr-5 text-2xl font-medium leading-[49px]">
          Error
        </h1>
        <h2 className="m-0 text-sm font-normal leading-[49px]">
          {error instanceof Error ? error.message : "Something went wrong."}
        </h2>
      </div>
    </main>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-canvas">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
