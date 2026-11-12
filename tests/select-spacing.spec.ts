import { test, expect } from "@playwright/test";

function selectSpacing() {
  return Array.from(document.querySelectorAll<HTMLSelectElement>("select"))
    .filter(select => select.offsetParent !== null)
    .map(select => {
      const style = getComputedStyle(select);
      return { label: select.getAttribute("aria-label") || select.name || select.id, appearance: style.appearance, paddingRight: parseFloat(style.paddingRight), backgroundImage: style.backgroundImage };
    });
}

test.describe("Select controls", () => {
  test("keep the chevron clear of the container edge", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View reports" }).click();

    const reportSelects = await page.evaluate(selectSpacing);
    expect(reportSelects.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "New case", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const allSelects = await page.evaluate(selectSpacing);

    for (const control of allSelects) {
      expect(control.appearance, `${control.label} needs a custom chevron`).toBe("none");
      expect(control.paddingRight, `${control.label} needs room for the chevron`).toBeGreaterThanOrEqual(32);
      expect(control.backgroundImage, `${control.label} needs a chevron image`).toContain("svg");
    }
  });
});
