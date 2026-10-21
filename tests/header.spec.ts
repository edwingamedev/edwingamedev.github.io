import { test, expect } from "@playwright/test";

test("mobile menu closes after selecting a link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");

  await page.goto("/");

  const menu = page.locator(".mobile-menu");
  const toggle = menu.locator("summary");

  await toggle.click();
  await expect(menu).toHaveAttribute("open", "");

  await menu.getByRole("link", { name: "About" }).click();

  await expect(menu).not.toHaveAttribute("open");
  await expect(page).toHaveURL(/#about$/);
});

test("mobile menu closes when clicking outside", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");

  await page.goto("/");

  const menu = page.locator(".mobile-menu");

  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");

  await page
    .getByRole("heading", {
      name: "Edwin Holanda",
      exact: true,
    })
    .click();

  await expect(menu).not.toHaveAttribute("open");
});

test("theme switcher updates theme and accessible labels", async ({ page }) => {
  await page.goto("/");

  const switcher = page.locator("[data-theme-switcher]").filter({ visible: true });

  const initialTheme = await page.locator("html").getAttribute("data-theme");
  const nextTheme = initialTheme === "dark" ? "light" : "dark";

  await switcher.click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", nextTheme);

  await expect(switcher).toHaveAttribute("aria-label", `Switch to ${initialTheme} mode`);

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", nextTheme);
});
