import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BhajanCard from "./BhajanCard";
import { LanguageProvider } from "@/hooks/useLanguage";
import type { Bhajan } from "@/data/bhajans";

const testBhajan: Bhajan = {
  id: 1,
  slug: "test-bhajan",
  title: "A Very Long Bhajan Headline That Should Expand Before Opening",
  titleHindi: "Test Hindi Title",
  deityId: 1,
  lyricsHindi: "",
  lyricsTransliteration: "",
  singerName: "Test Singer",
  playCount: 1000,
  rating: 4.5,
  tags: [],
  featured: false,
};

function renderCard() {
  render(
    <LanguageProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<BhajanCard bhajan={testBhajan} />} />
          <Route path="/bhajan/:slug" element={<div>Opened bhajan page</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe("BhajanCard", () => {
  it("expands the headline on first click and opens the bhajan on second click", () => {
    renderCard();

    const card = screen.getByRole("link", { name: /test hindi title/i });

    fireEvent.click(card);

    expect(screen.queryByText("Opened bhajan page")).not.toBeInTheDocument();
    expect(screen.getByText(testBhajan.title)).toHaveClass("line-clamp-none");

    fireEvent.click(card);

    expect(screen.getByText("Opened bhajan page")).toBeInTheDocument();
  });

  it("opens on second click from the expanded headline itself", () => {
    renderCard();

    const title = screen.getByText(testBhajan.title);

    fireEvent.click(title);
    expect(screen.queryByText("Opened bhajan page")).not.toBeInTheDocument();

    fireEvent.click(title);
    expect(screen.getByText("Opened bhajan page")).toBeInTheDocument();
  });
});
