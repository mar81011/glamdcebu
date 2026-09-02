import { test, expect } from "@playwright/test";

test.describe("GLAM'D Cebu — public flows", () => {
  test("home page shows the full menu and booking CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /^Menu$/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Lashes & Brows/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Nails$/i })).toBeVisible();
    await expect(page.getByText("Classic")).toBeVisible();
    await expect(page.getByText("₱499")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Our work/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Track my appointment/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Book an appointment/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Book Now$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Staff login/i })).toHaveCount(0);
  });

  test("services price list — lashes & brows", async ({ page }) => {
    await page.goto("/services/lashes-brows");
    await expect(page).toHaveURL(/\/#lashes-brows/);
    await expect(page.getByText("Classic")).toBeVisible();
    await expect(page.getByText("₱499")).toBeVisible();
  });

  test("services price list — nails", async ({ page }) => {
    await page.goto("/services/nails");
    await expect(page).toHaveURL(/\/#nails/);
    await expect(page.getByText("Nail gel plain")).toBeVisible();
  });

  test("booking flow — multi-step UI", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByText("Book Appointment")).toBeVisible();
    await expect(page.getByText(/Step 1 of 5/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Lashes & Brows/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Nails$/i })).toBeVisible();

    await expect(page.getByRole("button", { name: /Wispy/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /French tips/i })).toBeDisabled();

    await page.getByRole("button", { name: /Classic/i }).click();
    await expect(page.getByRole("button", { name: /Wispy/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /French tips/i })).toBeDisabled();

    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByText(/Step 2 of 5/)).toBeVisible();
  });

  test("tracking an appointment opens a modal on the same page", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel(/Order number/i).fill("GLAM-XXXXXX");
    await page.getByRole("button", { name: /Track my appointment/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByText(/No appointment found|Enter a valid/i)).toBeVisible();
  });

  test("menu books from the homepage CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Book an appointment/i }).click();
    await expect(page).toHaveURL(/\/book/);
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
      multipart: {
        customerName: "Playwright Test",
        phone: "09171234567",
        notes: "E2E test booking",
        date: dateKey,
        time: slots[0],
        mainServiceId,
        visitType: "walk_in",
        paymentReference: "GCASHTEST123",
        paymentProof: {
          name: "receipt.png",
          mimeType: "image/png",
          buffer: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            "base64",
          ),
        },
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
