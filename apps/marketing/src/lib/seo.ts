import { SITE_ORIGIN } from "./config";

export const DEFAULT_TITLE = "Journey Home — Save ahead. Prepare with dignity.";
export const DEFAULT_DESCRIPTION =
  "Families save a little each month toward professional photography and videography for a loved one's burial.";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/hero.webp`;

export interface PageSeoOptions {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

export function createPageHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: PageSeoOptions) {
  const fullTitle = title ? `${title} · Journey Home` : DEFAULT_TITLE;
  const canonicalUrl = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: image },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
    ],
  };
}
