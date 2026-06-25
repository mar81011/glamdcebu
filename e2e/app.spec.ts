import { test, expect } from "@playwright/test";

test.describe("GLAM'D Cebu — public flows", () => {
  test("home page loads with services and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Beauty & Nails/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Book Now/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /View Schedule/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Lashes & Brows/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Nails$/i }).first()).toBeVisible();
  });

  test("services price list — lashes & brows", async ({ page }) => {
    await page.goto("/services/lashes-brows");
    await expect(page.getByText("Price List")).toBeVisible();
    await expect(page.getByText("Classic")).toBeVisible();
    await expect(page.getByText("₱499")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book this service/i }).first()).toBeVisible();
  });

  test("services price list — nails", async ({ page }) => {
    await page.goto("/services/nails");
    await expect(page.getByText("GLAM'D D")).toBeVisible();
    await expect(page.getByText("Nail gel plain")).toBeVisible();
  });

  test("booking flow — multi-step UI", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByText("Book Appointment")).toBeVisible();
    await expect(page.getByText(/Step 1 of 5/)).toBeVisible();

    await page.getByRole("button", { name: /GLAM'D.*Lashes/i }).click();
    await page.getByRole("button", { name: /Classic/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByText(/Step 2 of 5/)).toBeVisible();
    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByText(/Step 3 of 5/)).toBeVisible();
  });

  test("service page deep-links into booking", async ({ page }) => {
    await page.goto("/services/lashes-brows");
    await page.getByRole("link", { name: /Book this service/i }).first().click();
    await expect(page).toHaveURL(/\/book\?/);
    await expect(page.getByText(/Step 1 of 5/)).toBeVisible();
  });

  test("admin route redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("schedule overview calendar", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: /Schedule Overview/i })).toBeVisible();
    await expect(page.getByText(/Sun|Mon|Tue/i).first()).toBeVisible();
  });

  test("footer contact info", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("0966 551 8594")).toBeVisible();
    await expect(page.getByText("@glam.d21")).toBeVisible();
  });

  test("admin login page", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /Admin Login/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });
});

test.describe("GLAM'D Cebu — booking API", () => {
  test("availability returns slots for a weekday", async ({ request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    while (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const dateKey = tomorrow.toISOString().split("T")[0];

    const res = await request.get(`/api/availability?date=${dateKey}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.slots)).toBeTruthy();
  });

  test("creates a booking and shows confirmation", async ({ page, request }) => {
    const servicesRes = await request.get("/api/services");
    expect(servicesRes.ok()).toBeTruthy();
    const catalog = await servicesRes.json();
    const lashes = catalog.categories?.find(
      (c: { slug: string }) => c.slug === "lashes-brows",
    );
    const mainServiceId = lashes?.mainServices?.[0]?.id;
    test.skip(!mainServiceId, "No active main service in catalog");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateKey = tomorrow.toISOString().split("T")[0];

    const availRes = await request.get(`/api/availability?date=${dateKey}`);
    const avail = await availRes.json();
    const slots: string[] = avail.slots ?? [];
    test.skip(slots.length === 0, "No slots available tomorrow");

    const bookRes = await request.post("/api/bookings", {
      data: {
        customerName: "Playwright Test",
        phone: "09171234567",
        notes: "E2E test booking",
        date: dateKey,
        time: slots[0],
        mainServiceId,
        addonIds: [],
        visitType: "walk_in",
      },
    });
    expect(bookRes.ok()).toBeTruthy();
    const { id } = await bookRes.json();
    expect(id).toBeTruthy();

    await page.goto(`/book/confirm/${id}`);
    await expect(page.getByText("Booking Request Sent")).toBeVisible();
    await expect(page.getByText("Playwright Test")).toBeVisible();
  });
});
