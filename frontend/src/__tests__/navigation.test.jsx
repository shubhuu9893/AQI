import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Note: These tests use the real Router implementation.
// The outer BrowserRouter provides a base, while the inner one in App manages routing.

describe("Navigation", () => {
  test("renders Dashboard page by default", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /dashboard/i })).toBeInTheDocument();
  });

  test("can navigate to Map page via sidebar link", async () => {
    const user = userEvent.setup();
    render(<App />);
    const mapLink = screen.getByRole("link", { name: /map/i });
    await user.click(mapLink);
    // Wait for the Map page heading to appear
    expect(await screen.findByRole("heading", { level: 1, name: /map/i })).toBeInTheDocument();
  });
});
