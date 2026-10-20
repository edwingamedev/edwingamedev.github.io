import { test, expect } from "@playwright/test";

test("projects page has the correct vertical spacing", async ({ page }, testInfo) => {
  await page.goto("/projects/");

  const layout = page.locator(".projects-layout");
  const expectedGap = testInfo.project.name === "mobile" ? "32px" : "40px";

  await expect(layout).toHaveCSS("row-gap", expectedGap);
  await expect(layout).toHaveCSS("flex-direction", "column");
});

test("project grid is responsive and centered", async ({ page }, testInfo) => {
  await page.goto("/projects/");

  const grid = page.locator(".projects-grid");

  const columns = await grid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length
  );

  expect(columns).toBe(testInfo.project.name === "mobile" ? 1 : 3);

  const gridBox = await grid.boundingBox();
  const viewport = page.viewportSize();

  expect(gridBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  const gridCenter = gridBox!.x + gridBox!.width / 2;
  const viewportCenter = viewport!.width / 2;

  expect(Math.abs(gridCenter - viewportCenter)).toBeLessThan(2);
});
