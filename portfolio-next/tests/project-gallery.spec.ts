import { test, expect } from "@playwright/test";

test("gallery supports infinite navigation in both directions", async ({ page }) => {
  await page.goto("/projects/");

  const projectLinks = page.locator('a[href^="/projects/"]').filter({
    has: page.locator("h3"),
  });

  const links = await projectLinks.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href")).filter(Boolean)
  );

  let galleryFound = false;

  for (const href of links) {
    await page.goto(href!);

    const items = page.locator("[data-gallery-item]");
    const total = await items.count();

    if (total < 2) continue;

    galleryFound = true;

    await items.first().click();

    const dialog = page.locator("[data-gallery-dialog]");
    const counter = page.locator("[data-gallery-count]");

    await expect(dialog).toBeVisible();
    await expect(counter).toHaveText(`1 / ${total}`);

    await dialog.locator("[data-gallery-prev]").click();
    await expect(counter).toHaveText(`${total} / ${total}`);

    await dialog.locator("[data-gallery-next]").click();
    await expect(counter).toHaveText(`1 / ${total}`);

    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(`2 / ${total}`);

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    break;
  }

  expect(galleryFound, "Expected a project with at least two gallery items").toBe(true);
});
