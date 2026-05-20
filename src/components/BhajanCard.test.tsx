import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BhajanCard from "./BhajanCard";
import { LanguageProvider } from "@/hooks/useLanguage";
import { YouTubePlayerProvider } from "@/hooks/useYouTubePlayer";
import { BhajanModalOpenProvider } from "@/hooks/useBhajanModalOpen";
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
      <YouTubePlayerProvider>
        <BhajanModalOpenProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="/" element={<BhajanCard bhajan={testBhajan} />} />
            </Routes>
          </MemoryRouter>
        </BhajanModalOpenProvider>
      </YouTubePlayerProvider>
    </LanguageProvider>,
  );
}

describe("BhajanCard", () => {
  it("opens the detail modal when the card is clicked", async () => {
    renderCard();

    const heading = screen.getByRole("heading", { name: /A Very Long Bhajan Headline/i });
    const card = heading.closest('div[tabindex="0"]');
    expect(card).toBeTruthy();
    fireEvent.click(card!);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /Play now|अब सुनें/i })).toBeInTheDocument();
  });
});
