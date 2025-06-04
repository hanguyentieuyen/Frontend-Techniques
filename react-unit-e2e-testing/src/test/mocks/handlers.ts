import { http, HttpResponse } from "msw";

export const handlers = [
  // Successful registration
  http.post("/api/register", async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    // Simulate validation error
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // Simulate server error
    if (body.email === "server-error@example.com") {
      return HttpResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Success response
    return HttpResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: "123",
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    });
  }),
];
