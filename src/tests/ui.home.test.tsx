import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/app/page";

test("renders hero", () => {
  render(<Home />);
  expect(screen.getByText(/Watchful Guardian for Meds/i)).toBeInTheDocument();
});
