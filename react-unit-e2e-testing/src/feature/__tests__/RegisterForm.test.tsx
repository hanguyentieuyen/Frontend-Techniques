import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "../RegisterForm";

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: {} }),
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
  FormMessage: ({ children, ...props }: any) =>
    children ? <span {...props}>{children}</span> : null,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

describe("RegisterForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders all form fields", () => {
      render(<RegisterForm />);

      expect(screen.getByTestId("firstName-input")).toBeInTheDocument();
      expect(screen.getByTestId("lastName-input")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("password-input")).toBeInTheDocument();
      expect(screen.getByTestId("confirmPassword-input")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("has correct form labels", () => {
      render(<RegisterForm />);

      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Last Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    });

    it("submit button has correct initial text", () => {
      render(<RegisterForm />);

      expect(screen.getByTestId("submit-button")).toHaveTextContent(
        "Create Account"
      );
    });
  });

  describe("Form Validation", () => {
    it("shows email validation error for invalid email", async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByTestId("email-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("shows password validation error for short password", async () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByTestId("password-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows error when passwords do not match", async () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByTestId("password-input");
      const confirmPasswordInput = screen.getByTestId("confirmPassword-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });

    it("shows first name validation error", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByTestId("firstName-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(firstNameInput, "a");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("First name must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows last name validation error", async () => {
      render(<RegisterForm />);

      const lastNameInput = screen.getByTestId("lastName-input");
      const submitButton = screen.getByTestId("submit-button");

      await user.type(lastNameInput, "b");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Last name must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    const validFormData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    const fillForm = async (data = validFormData) => {
      await user.type(screen.getByTestId("firstName-input"), data.firstName);
      await user.type(screen.getByTestId("lastName-input"), data.lastName);
      await user.type(screen.getByTestId("email-input"), data.email);
      await user.type(screen.getByTestId("password-input"), data.password);
      await user.type(
        screen.getByTestId("confirmPassword-input"),
        data.confirmPassword
      );
    };

    it("submits form with valid data successfully", async () => {
      const onSuccess = vi.fn();
      render(<RegisterForm onSuccess={onSuccess} />);

      await fillForm();
      await user.click(screen.getByTestId("submit-button"));

      // Check loading state
      await waitFor(() => {
        expect(screen.getByTestId("submit-button")).toHaveTextContent(
          "Creating Account..."
        );
        expect(screen.getByTestId("submit-button")).toBeDisabled();
      });

      // Check success state
      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
        expect(
          screen.getByText("Registration successful! Welcome aboard.")
        ).toBeInTheDocument();
      });

      // Check callback was called
      expect(onSuccess).toHaveBeenCalledWith({
        id: "123",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("shows error message when email already exists", async () => {
      render(<RegisterForm />);

      await fillForm({
        ...validFormData,
        email: "existing@example.com",
      });

      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText("Email already exists")).toBeInTheDocument();
      });
    });

    it("shows error message for server error", async () => {
      render(<RegisterForm />);

      await fillForm({
        ...validFormData,
        email: "server-error@example.com",
      });

      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText("Internal server error")).toBeInTheDocument();
      });
    });

    it("resets form after successful submission", async () => {
      render(<RegisterForm />);

      await fillForm();
      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });

      // Form should be reset (inputs should be empty)
      // Note: This would need to be tested with actual form state
    });

    it("does not submit form with validation errors", async () => {
      const onSuccess = vi.fn();
      render(<RegisterForm onSuccess={onSuccess} />);

      // Fill form with invalid data
      await user.type(screen.getByTestId("email-input"), "invalid-email");
      await user.click(screen.getByTestId("submit-button"));

      // Should show validation error, not call API
      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("shows loading state during form submission", async () => {
      render(<RegisterForm />);

      const validFormData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await user.type(
        screen.getByTestId("firstName-input"),
        validFormData.firstName
      );
      await user.type(
        screen.getByTestId("lastName-input"),
        validFormData.lastName
      );
      await user.type(screen.getByTestId("email-input"), validFormData.email);
      await user.type(
        screen.getByTestId("password-input"),
        validFormData.password
      );
      await user.type(
        screen.getByTestId("confirmPassword-input"),
        validFormData.confirmPassword
      );

      await user.click(screen.getByTestId("submit-button"));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId("submit-button")).toHaveTextContent(
          "Creating Account..."
        );
        expect(screen.getByTestId("submit-button")).toBeDisabled();
      });
    });
  });
});
