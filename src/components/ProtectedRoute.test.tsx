import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute(requireAdmin = false) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requireAdmin={requireAdmin}>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("redirects unauthenticated users to login", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAdmin: false,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders content for authenticated users", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      isAdmin: false,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects non-admin users away from admin routes", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" },
      loading: false,
      isAdmin: false,
    } as ReturnType<typeof useAuth>);

    renderProtectedRoute(true);

    expect(screen.getByText("Home page")).toBeInTheDocument();
  });
});
