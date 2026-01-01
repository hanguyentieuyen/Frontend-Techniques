import { test, expect } from "@playwright/test";

test.describe("Register Form E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your register page
    await page.goto("/register");
  });

  test("should display all form fields", async ({ page }) => {
    await expect(page.getByTestId("firstName-input")).toBeVisible();
    await expect(page.getByTestId("lastName-input")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("password-input")).toBeVisible();
    await expect(page.getByTestId("confirmPassword-input")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
  });

  test("should show validation errors for invalid inputs", async ({ page }) => {
    // Test email validation
    await page.getByTestId("email-input").fill("invalid-email");
    await page.getByTestId("submit-button").click();

    await expect(page.getByText("Invalid email address")).toBeVisible();

    // Test password validation
    await page.getByTestId("email-input").fill("valid@example.com");
    await page.getByTestId("password-input").fill("123");
    await page.getByTestId("submit-button").click();

    await expect(
      page.getByText("Password must be at least 8 characters")
    ).toBeVisible();

    // Test password confirmation
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirmPassword-input").fill("different123");
    await page.getByTestId("submit-button").click();

    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test("should successfully register with valid data", async ({ page }) => {
    // Mock the API response
    await page.route("/api/register", async (route) => {
      const json = {
        success: true,
        message: "Registration successful",
        user: {
          id: "123",
          email: "john@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      };
      await route.fulfill({ json });
    });

    // Fill out the form
    await page.getByTestId("firstName-input").fill("John");
    await page.getByTestId("lastName-input").fill("Doe");
    await page.getByTestId("email-input").fill("john@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirmPassword-input").fill("password123");

    // Submit the form
    await page.getByTestId("submit-button").click();

    // Check loading state
    await expect(page.getByTestId("submit-button")).toHaveText(
      "Creating Account..."
    );
    await expect(page.getByTestId("submit-button")).toBeDisabled();

    // Check success message
    await expect(page.getByTestId("success-message")).toBeVisible();
    await expect(
      page.getByText("Registration successful! Welcome aboard.")
    ).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API error response
    await page.route("/api/register", async (route) => {
      const json = {
        success: false,
        message: "Email already exists",
      };
      await route.fulfill({
        status: 400,
        json,
      });
    });

    // Fill and submit form
    await page.getByTestId("firstName-input").fill("John");
    await page.getByTestId("lastName-input").fill("Doe");
    await page.getByTestId("email-input").fill("existing@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirmPassword-input").fill("password123");

    await page.getByTestId("submit-button").click();

    // Check error message
    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByText("Email already exists")).toBeVisible();
  });

  test("should handle network errors", async ({ page }) => {
    // Mock network failure
    await page.route("/api/register", (route) => route.abort());

    // Fill and submit form
    await page.getByTestId("firstName-input").fill("John");
    await page.getByTestId("lastName-input").fill("Doe");
    await page.getByTestId("email-input").fill("john@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirmPassword-input").fill("password123");

    await page.getByTestId("submit-button").click();

    // Should show generic error
    await expect(page.getByTestId("error-message")).toBeVisible();
  });

  test("should be accessible", async ({ page }) => {
    // Check for proper labels
    await expect(page.getByText("First Name")).toBeVisible();
    await expect(page.getByText("Last Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Password")).toBeVisible();
    await expect(page.getByText("Confirm Password")).toBeVisible();

    // Check that inputs have proper types
    await expect(page.getByTestId("email-input")).toHaveAttribute(
      "type",
      "email"
    );
    await expect(page.getByTestId("password-input")).toHaveAttribute(
      "type",
      "password"
    );
    await expect(page.getByTestId("confirmPassword-input")).toHaveAttribute(
      "type",
      "password"
    );
  });

  test("should navigate with keyboard", async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("firstName-input")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("lastName-input")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("email-input")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("password-input")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("confirmPassword-input")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByTestId("submit-button")).toBeFocused();
  });

  test("should submit form with Enter key", async ({ page }) => {
    await page.route("/api/register", async (route) => {
      const json = {
        success: true,
        message: "Registration successful",
        user: {
          id: "123",
          email: "john@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      };
      await route.fulfill({ json });
    });

    // Fill form
    await page.getByTestId("firstName-input").fill("John");
    await page.getByTestId("lastName-input").fill("Doe");
    await page.getByTestId("email-input").fill("john@example.com");
    await page.getByTestId("password-input").fill("password123");
    await page.getByTestId("confirmPassword-input").fill("password123");

    // Press Enter to submit
    await page.getByTestId("confirmPassword-input").press("Enter");

    // Should show success
    await expect(page.getByTestId("success-message")).toBeVisible();
  });
});

// Playwright configuration (playwright.config.ts)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
