import { expect, test } from "@playwright/test";

test("renders the default demo", async ({ page }) => {
  await page.goto("/?driver=mock");

  await expect(
    page.getByRole("heading", { name: "Strudel Brainf*ck REPL" }),
  ).toBeVisible();
  await expect(page.getByTestId("live-status")).toHaveText("Idle");
  await expect(page.getByTestId("decoded-bf-output")).toContainText(
    "strudel_url=https://raw.githubusercontent.com/eefano/strudel-songs-collection",
  );
  await expect(page.getByTestId("canonical-strudel")).toContainText(
    "setcps(0.7)",
  );
});

test("updates highlighted Brainfuck tokens while playing", async ({ page }) => {
  await page.goto("/?driver=mock");

  await page.getByRole("button", { name: "Play" }).click();

  await expect(page.getByTestId("live-status")).toHaveText("Live");
  await expect(page.getByTestId("canonical-strudel")).toContainText(
    "p2:",
  );
  await expect(page.locator('[data-testid="token-chip"].token-active').first()).toBeVisible();
  await expect(page.locator(".cm-bf-active-range").first()).toBeVisible();

  await page.getByRole("button", { name: "Stop" }).click();

  await expect(page.getByTestId("live-status")).toHaveText("Idle");
});
