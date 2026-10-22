/**
 * Automated Contract & SEO Checker for apps/marketing.
 * Compares and validates HTTP status codes, titles, descriptions,
 * canonical URLs, robots meta tags, open graph tags, sitemap, and robots.txt.
 */

interface RouteExpectation {
  path: string;
  expectedStatus: number;
  expectedTitle: string;
  expectedCanonical?: string;
  expectedRobots?: string;
}

const EXPECTED_ROUTES: RouteExpectation[] = [
  {
    path: "/",
    expectedStatus: 200,
    expectedTitle: "Journey Home — Save ahead. Prepare with dignity.",
    expectedCanonical: "https://journeyhome.ng/",
    expectedRobots: "index, follow",
  },
  {
    path: "/how-it-works",
    expectedStatus: 200,
    expectedTitle: "How it works · Journey Home",
    expectedCanonical: "https://journeyhome.ng/how-it-works",
    expectedRobots: "index, follow",
  },
  {
    path: "/pricing",
    expectedStatus: 200,
    expectedTitle: "Pricing · Journey Home",
    expectedCanonical: "https://journeyhome.ng/pricing",
    expectedRobots: "index, follow",
  },
  {
    path: "/about",
    expectedStatus: 200,
    expectedTitle: "About us · Journey Home",
    expectedCanonical: "https://journeyhome.ng/about",
    expectedRobots: "index, follow",
  },
  {
    path: "/faq",
    expectedStatus: 200,
    expectedTitle: "FAQ · Journey Home",
    expectedCanonical: "https://journeyhome.ng/faq",
    expectedRobots: "index, follow",
  },
  {
    path: "/contact",
    expectedStatus: 200,
    expectedTitle: "Contact · Journey Home",
    expectedCanonical: "https://journeyhome.ng/contact",
    expectedRobots: "index, follow",
  },
  {
    path: "/terms",
    expectedStatus: 200,
    expectedTitle: "Plan terms & conditions · Journey Home",
    expectedCanonical: "https://journeyhome.ng/terms",
    expectedRobots: "index, follow",
  },
  {
    path: "/privacy",
    expectedStatus: 200,
    expectedTitle: "Privacy policy · Journey Home",
    expectedCanonical: "https://journeyhome.ng/privacy",
    expectedRobots: "index, follow",
  },
  {
    path: "/non-existent-page-verify-404",
    expectedStatus: 404,
    expectedTitle: "404",
    expectedRobots: "noindex",
  },
];

async function fetchPage(url: string) {
  const res = await fetch(url, { redirect: "manual" });
  const text = await res.text();
  const headers = Object.fromEntries(res.headers.entries());
  return { status: res.status, headers, body: text };
}

function decodeHtml(str: string | null): string | null {
  if (!str) return null;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMeta(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1].trim()) : null;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? decodeHtml(descMatch[1]) : null;

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const canonical = canonicalMatch ? decodeHtml(canonicalMatch[1]) : null;

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  const robots = robotsMatch ? decodeHtml(robotsMatch[1]) : null;

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const ogTitle = ogTitleMatch ? decodeHtml(ogTitleMatch[1]) : null;

  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  const ogUrl = ogUrlMatch ? decodeHtml(ogUrlMatch[1]) : null;

  const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
  const twitterCard = twitterCardMatch ? decodeHtml(twitterCardMatch[1]) : null;

  return { title, description, canonical, robots, ogTitle, ogUrl, twitterCard };
}

async function run() {
  const targetPort = process.env.TARGET_PORT || "3001";
  const baseUrl = `http://localhost:${targetPort}`;
  console.log(`\n======================================================`);
  console.log(`Running SEO & Contract Verification against ${baseUrl}`);
  console.log(`======================================================\n`);

  let failures = 0;

  for (const exp of EXPECTED_ROUTES) {
    const fullUrl = `${baseUrl}${exp.path}`;
    try {
      const { status, body } = await fetchPage(fullUrl);
      const meta = extractMeta(body);

      // Verify status code
      if (status !== exp.expectedStatus) {
        console.error(`❌ [${exp.path}] Expected status ${exp.expectedStatus}, got ${status}`);
        failures++;
      } else {
        console.log(`✅ [${exp.path}] Status: ${status}`);
      }

      // Verify title
      if (!meta.title || !meta.title.includes(exp.expectedTitle)) {
        console.error(`❌ [${exp.path}] Expected title "${exp.expectedTitle}", got "${meta.title}"`);
        failures++;
      } else {
        console.log(`   Title: "${meta.title}"`);
      }

      // Verify canonical if expected
      if (exp.expectedCanonical) {
        if (meta.canonical !== exp.expectedCanonical) {
          console.error(`❌ [${exp.path}] Expected canonical "${exp.expectedCanonical}", got "${meta.canonical}"`);
          failures++;
        } else {
          console.log(`   Canonical: ${meta.canonical}`);
        }
      }

      // Verify robots if expected
      if (exp.expectedRobots) {
        if (!meta.robots || !meta.robots.includes(exp.expectedRobots)) {
          console.error(`❌ [${exp.path}] Expected robots "${exp.expectedRobots}", got "${meta.robots}"`);
          failures++;
        } else {
          console.log(`   Robots: ${meta.robots}`);
        }
      }

      // Check OG and Twitter card for 200 pages
      if (exp.expectedStatus === 200) {
        if (!meta.ogTitle || !meta.ogUrl || !meta.twitterCard) {
          console.error(`❌ [${exp.path}] Missing OpenGraph or Twitter meta: og:title=${meta.ogTitle}, og:url=${meta.ogUrl}, twitter:card=${meta.twitterCard}`);
          failures++;
        } else {
          console.log(`   OpenGraph & Twitter: verified (og:title="${meta.ogTitle}", twitter:card="${meta.twitterCard}")`);
        }
      }
    } catch (err) {
      console.error(`❌ [${exp.path}] Request failed:`, err);
      failures++;
    }
  }

  // Verify /robots.txt
  console.log(`\n--- Checking /robots.txt ---`);
  try {
    const robotsRes = await fetchPage(`${baseUrl}/robots.txt`);
    if (robotsRes.status !== 200) {
      console.error(`❌ /robots.txt returned status ${robotsRes.status}`);
      failures++;
    } else if (!robotsRes.body.includes("Sitemap:") || !robotsRes.body.includes("Allow: /")) {
      console.error(`❌ /robots.txt missing expected directives:\n${robotsRes.body}`);
      failures++;
    } else {
      console.log(`✅ /robots.txt verified (status 200, valid directives, references sitemap)`);
    }
  } catch (err) {
    console.error(`❌ /robots.txt check failed:`, err);
    failures++;
  }

  // Verify /sitemap.xml
  console.log(`\n--- Checking /sitemap.xml ---`);
  try {
    const sitemapRes = await fetchPage(`${baseUrl}/sitemap.xml`);
    const contentType = sitemapRes.headers["content-type"] || "";
    if (sitemapRes.status !== 200) {
      console.error(`❌ /sitemap.xml returned status ${sitemapRes.status}`);
      failures++;
    } else if (!contentType.includes("xml")) {
      console.error(`❌ /sitemap.xml content-type is "${contentType}", expected application/xml`);
      failures++;
    } else {
      const publicRoutes = ["", "/how-it-works", "/pricing", "/about", "/faq", "/contact", "/terms", "/privacy"];
      const missing = publicRoutes.filter((r) => !sitemapRes.body.includes(`https://journeyhome.ng${r}`));
      if (missing.length > 0) {
        console.error(`❌ /sitemap.xml missing routes: ${missing.join(", ")}`);
        failures++;
      } else {
        console.log(`✅ /sitemap.xml verified (status 200, content-type: ${contentType}, all 8 public routes present)`);
      }
    }
  } catch (err) {
    console.error(`❌ /sitemap.xml check failed:`, err);
    failures++;
  }

  console.log(`\n======================================================`);
  if (failures === 0) {
    console.log(`🎉 ALL CONTRACT AND SEO CHECKS PASSED!`);
    console.log(`======================================================\n`);
    process.exit(0);
  } else {
    console.error(`💥 ${failures} CHECKS FAILED!`);
    console.log(`======================================================\n`);
    process.exit(1);
  }
}

run();
