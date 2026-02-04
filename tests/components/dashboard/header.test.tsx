/**
 * Dashboard Header Component Tests
 *
 * Tests the dashboard header with user menu.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Clerk
const mockSignOut = vi.fn();
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({
    user: {
      id: "user_123",
      firstName: "John",
      lastName: "Doe",
      imageUrl: "https://example.com/avatar.jpg",
      emailAddresses: [{ emailAddress: "john@example.com" }],
    },
  })),
  useClerk: vi.fn(() => ({
    signOut: mockSignOut,
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

// Import component after mocks
import { DashboardHeader } from "@/components/dashboard/header";
import { useUser } from "@clerk/nextjs";

describe("DashboardHeader Component", () => {
  const mockOnMobileMenuClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  describe("Rendering", () => {
    it("should render mobile menu trigger", () => {
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const menuButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      expect(menuButton).toBeInTheDocument();
    });

    it("should render user avatar button", () => {
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      // Avatar shows initials JD as fallback (image may not load in test)
      const avatarButton = screen.getByRole("button", { name: /jd/i });
      expect(avatarButton).toBeInTheDocument();
    });

    it("should call onMobileMenuClick when hamburger is clicked", () => {
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const menuButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      fireEvent.click(menuButton);

      expect(mockOnMobileMenuClick).toHaveBeenCalled();
    });
  });

  describe("User Menu", () => {
    it("should show user menu when avatar is clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      // Click avatar to open dropdown
      const avatarButton = screen.getByRole("button", { name: /jd/i });
      await user.click(avatarButton);

      // Menu should be visible
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });

    it("should show profile and settings links", async () => {
      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const avatarButton = screen.getByRole("button", { name: /jd/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
      });
    });

    it("should show sign out option", async () => {
      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const avatarButton = screen.getByRole("button", { name: /jd/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("Sign out")).toBeInTheDocument();
      });
    });

    it("should call signOut when sign out is clicked", async () => {
      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const avatarButton = screen.getByRole("button", { name: /jd/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("Sign out")).toBeInTheDocument();
      });

      const signOutButton = screen.getByText("Sign out");
      await user.click(signOutButton);

      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/" });
    });
  });

  describe("User Display", () => {
    it("should display full name when available", async () => {
      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      const avatarButton = screen.getByRole("button", { name: /jd/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });

    it("should display first name only when last name is missing", async () => {
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
        user: {
          id: "user_123",
          firstName: "John",
          lastName: null,
          imageUrl: null,
          emailAddresses: [{ emailAddress: "john@example.com" }],
        },
      });

      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      // Avatar shows "J" for John (first letter of first name)
      const avatarButton = screen.getByText("J").closest("button");
      expect(avatarButton).toBeInTheDocument();
      await user.click(avatarButton!);

      await waitFor(() => {
        expect(screen.getByText("John")).toBeInTheDocument();
      });
    });

    it("should display email when name is missing", async () => {
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
        user: {
          id: "user_123",
          firstName: null,
          lastName: null,
          imageUrl: null,
          emailAddresses: [{ emailAddress: "john@example.com" }],
        },
      });

      const user = userEvent.setup();
      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      // Avatar fallback shows "J" (first letter of email)
      const avatarButton = screen.getByText("J").closest("button");
      expect(avatarButton).toBeInTheDocument();
      await user.click(avatarButton!);

      await waitFor(() => {
        // Email should be shown as the display name
        const emailElements = screen.getAllByText("john@example.com");
        expect(emailElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Avatar Fallback", () => {
    it("should show initials when image is not available", () => {
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue({
        user: {
          id: "user_123",
          firstName: "John",
          lastName: "Doe",
          imageUrl: null,
          emailAddresses: [{ emailAddress: "john@example.com" }],
        },
      });

      render(<DashboardHeader onMobileMenuClick={mockOnMobileMenuClick} />);

      // Should show initials JD
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});
