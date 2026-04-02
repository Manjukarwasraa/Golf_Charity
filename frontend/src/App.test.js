import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

test("renders the auth landing experience", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: /turn every round into community impact/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /sign in to manage your charity rounds/i })
  ).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/golfer@example.com/i)).toBeInTheDocument();
});
