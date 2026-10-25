/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CatchBoundary } from "@/components/catch-boundary";
import globalsCss from "@/styles/globals.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: globalsCss },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: CatchBoundary,
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
    <>
      <title>404: This page could not be found. · Journey Home</title>
      <meta name="robots" content="noindex, nofollow" />
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
    </>
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
