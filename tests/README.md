# Testing Guide for Ten Labs

This document provides guidelines for writing and running tests in the Ten Labs project.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── vitest.d.ts                 # TypeScript declarations for Vitest
├── README.md                   # This file
├── lib/
│   └── services/
│       ├── ttsService.test.ts       # TTS service tests
│       └── backblazeService.test.ts # Backblaze B2 tests
├── models/
│   └── userModel.test.ts       # User model tests
└── app/
    └── tts/
        └── ttsPageComponent.test.tsx  # TTS client component tests
```

## Writing Tests

### Service Tests

Service tests mock external dependencies (APIs, databases) and test business logic.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TTSRequest } from "@/types/TTSRequest";

// Mock external modules
vi.mock("@/lib/mongodb", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

describe("myService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle valid request", async () => {
    // Arrange
    const request: TTSRequest = { userId: "user_123", text: "Hello", voiceId: "bella" };

    // Act
    const result = await myService(request);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Model Tests

Model tests validate schema rules and data structures.

```typescript
import { describe, it, expect } from "vitest";
import type { IUser } from "@/models/User";

describe("User Model", () => {
  it("should require clerkId", () => {
    const validation = validateUserData({ email: "test@example.com" });
    expect(validation.errors).toContain("clerkId is required");
  });
});
```

### Component Tests

Component tests use React Testing Library to test UI behavior.

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({ user: { id: "user_123" } })),
}));

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should handle user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Clicked!")).toBeInTheDocument();
  });
});
```

## Mocking Guidelines

### Mocking External APIs

```typescript
// Mock global fetch
(global.fetch as Mock).mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: "value" }),
});

// Mock failed response
(global.fetch as Mock).mockResolvedValue({
  ok: false,
  status: 500,
  text: () => Promise.resolve("Server Error"),
});
```

### Mocking MongoDB Models

```typescript
vi.mock("@/models/User", () => ({
  User: {
    findOne: vi.fn().mockResolvedValue({
      _id: "user-id",
      clerkId: "user_123",
      plan: "free",
      usage: { charactersUsed: 0, generationsUsed: 0 },
      save: vi.fn(),
    }),
  },
}));
```

### Mocking Clerk Authentication

```typescript
vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(() => ({
    user: { id: "user_123" },
    isLoaded: true,
    isSignedIn: true,
  })),
  currentUser: vi.fn().mockResolvedValue({ id: "user_123" }),
}));
```

## AAA Pattern

Follow the Arrange-Act-Assert pattern for all tests:

```typescript
it("should calculate total correctly", () => {
  // Arrange - Set up test data
  const items = [{ price: 10 }, { price: 20 }];

  // Act - Execute the code under test
  const total = calculateTotal(items);

  // Assert - Verify the results
  expect(total).toBe(30);
});
```

## Best Practices

1. **Keep tests small and focused** - Each test should verify one behavior
2. **Use descriptive test names** - Test names should describe what is being tested
3. **Reset mocks between tests** - Use `beforeEach(() => vi.clearAllMocks())`
4. **Don't test implementation details** - Test behavior, not internal workings
5. **Use type imports** - Import types to ensure type correctness in tests
6. **Mock at the boundary** - Mock external services, not internal functions

## Coverage

Coverage reports are generated in the `coverage/` directory:

```bash
npm run test:coverage
```

Coverage includes:
- `text` - Terminal output
- `json` - Machine-readable JSON
- `html` - Browser-viewable report (open `coverage/index.html`)

## CI Integration

The `npm test` command is designed to run in CI environments:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

- name: Run tests with coverage
  run: npm run test:coverage
```

## Troubleshooting

### "Cannot find module" errors

Ensure the `@/*` path alias is configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

### Mock not working

Ensure mocks are defined before importing the module that uses them:

```typescript
// ❌ Wrong - import before mock
import { myService } from "@/lib/services/myService";
vi.mock("@/lib/mongodb", ...);

// ✅ Correct - mock before import
vi.mock("@/lib/mongodb", ...);
import { myService } from "@/lib/services/myService";
```

### Component tests failing

Ensure you have the setup file configured and jest-dom matchers imported:

```typescript
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
```
