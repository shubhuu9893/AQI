import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";

function TestComponent() {
  const { theme } = React.useContext(ThemeContext);
  return <div data-testid="theme-value">{theme}</div>;
}

import Navbar from "../components/common/Navbar";

describe("ThemeProvider", () => {
  test("provides initial theme and toggles on button click", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Navbar title="Test" />
        <TestComponent />
      </ThemeProvider>,
    );

    const themeValueElement = screen.getByTestId("theme-value");
    const initialTheme = themeValueElement.textContent;
    // Click the toggle button
    const toggleBtn = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleBtn);
    expect(themeValueElement).toHaveTextContent(/light|dark/i);
    expect(themeValueElement.textContent).not.toBe(initialTheme);
  });
});