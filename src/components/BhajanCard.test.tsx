import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BhajanCard from "./BhajanCard";
import { LanguageProvider } from "@/hooks/useLanguage";
import type { Bhajan } from "@/data/bhajans";

const testBhajan: Bhajan = {
  id: 1,
  slug: "test-bhajan",
  title: "A Very Long Bhajan Headline That Should Stay Truncated Until Hover",
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
  it("opens the bhajan on a single click", () => {
    renderCard();

    const card = screen.getByRole("link", { name: /test hindi title/i });

    fireEvent.click(card);

    expect(screen.getByText("Opened bhajan page")).toBeInTheDocument();
  });
});
