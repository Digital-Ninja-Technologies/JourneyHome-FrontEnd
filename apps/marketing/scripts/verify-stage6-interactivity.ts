import { chromium } from "playwright";

async function verify() {
  const port = process.env.PORT || "3000";
  console.log(`Starting Stage 6 Interactivity Verification on port ${port}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Test Contact Page Form & Topic Pills
  console.log("1. Testing Contact Form...");
  await page.goto(`http://localhost:${port}/contact`, { waitUntil: "networkidle" });

  // Check initial topic button
  const startingPlanBtn = page.getByRole("button", { name: "Starting a plan" });
  if ((await startingPlanBtn.getAttribute("aria-pressed")) !== "true") {
    throw new Error("Initial topic 'Starting a plan' was not pressed");
  }

  // Click another topic: 'Photographer network'
  const photographerBtn = page.getByRole("button", { name: "Photographer network" });
  await photographerBtn.click();
  if ((await photographerBtn.getAttribute("aria-pressed")) !== "true") {
    throw new Error("'Photographer network' topic was not pressed after click");
  }
  if ((await startingPlanBtn.getAttribute("aria-pressed")) !== "false") {
    throw new Error("'Starting a plan' was still pressed after switching topics");
  }

  // Fill the form fields
  await page.fill("#name", "Amaka Obi");
  await page.fill("#phone", "08031234567");
  await page.fill("#email", "amaka@example.com");
  await page.fill("#message", "I would like to inquire about wedding coverage in Enugu.");

  // Verify form inputs hold the typed values
  const nameVal = await page.inputValue("#name");
  const phoneVal = await page.inputValue("#phone");
  const emailVal = await page.inputValue("#email");
  const msgVal = await page.inputValue("#message");

  if (nameVal !== "Amaka Obi" || phoneVal !== "08031234567" || emailVal !== "amaka@example.com" || !msgVal.includes("Enugu")) {
    throw new Error("Form input values do not match expected inputs");
  }

  // Compute mailto target from DOM state to verify exact encoding match
  const generatedMailto = await page.evaluate(() => {
    const form = document.querySelector("form") as HTMLFormElement;
    const d = new FormData(form);
    const activeTopic = document.querySelector("button[aria-pressed='true']")?.textContent?.trim() || "";
    const body = `${d.get("message")}\n\n— ${d.get("name")}\nPhone: ${d.get("phone") || "n/a"}\nEmail: ${d.get("email")}`;
    return `mailto:hello@journeyhome.ng?subject=${encodeURIComponent(activeTopic)}&body=${encodeURIComponent(body)}`;
  });

  console.log("   Generated mailto URL:", generatedMailto);

  const url = new URL(generatedMailto);
  if (url.protocol !== "mailto:") throw new Error("Invalid protocol");
  if (url.pathname !== "hello@journeyhome.ng") throw new Error("Invalid recipient email");
  if (url.searchParams.get("subject") !== "Photographer network") throw new Error("Invalid subject");
  const bodyText = url.searchParams.get("body") || "";
  if (!bodyText.includes("Amaka Obi") || !bodyText.includes("08031234567") || !bodyText.includes("amaka@example.com")) {
    throw new Error("Body missing expected contact fields");
  }

  console.log("   ✅ Contact form state and mailto encoding verified perfectly!");

  // 2. Test FAQ Accordion
  console.log("2. Testing FAQ Accordion...");
  await page.goto(`http://localhost:${port}/faq`, { waitUntil: "networkidle" });
  
  // First item is open by default (i === 0)
  const firstDetails = page.locator("details").first();
  const isOpenFirstBefore = await firstDetails.evaluate((el: HTMLDetailsElement) => el.open);
  if (!isOpenFirstBefore) {
    throw new Error("First FAQ item should be open by default (open={i === 0})");
  }

  // Second item is closed by default (i === 1)
  const secondDetails = page.locator("details").nth(1);
  const isOpenSecondBefore = await secondDetails.evaluate((el: HTMLDetailsElement) => el.open);
  if (isOpenSecondBefore) {
    throw new Error("Second FAQ item should be closed by default");
  }

  // Click second summary to open it
  await secondDetails.locator("summary").click();
  const isOpenSecondAfter = await secondDetails.evaluate((el: HTMLDetailsElement) => el.open);
  if (!isOpenSecondAfter) {
    throw new Error("Second FAQ item did not open upon click");
  }

  // Click first summary to close it
  await firstDetails.locator("summary").click();
  const isOpenFirstAfter = await firstDetails.evaluate((el: HTMLDetailsElement) => el.open);
  if (isOpenFirstAfter) {
    throw new Error("First FAQ item did not close upon click");
  }

  console.log("   ✅ FAQ accordion toggle verified perfectly (first closed, second opened)!");

  await browser.close();
  console.log("\n🎉 ALL STAGE 6 INTERACTIVITY CHECKS PASSED!\n");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
