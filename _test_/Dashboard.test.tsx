import React from "react";
import { render, screen } from "@testing-library/react";
import NewsPage from "../src/pages/NewsPage";

test("renders news page title", () => {
  render(<NewsPage />);
  expect(screen.getByText(/Noticias y Avisos/i)).toBeInTheDocument();
});



