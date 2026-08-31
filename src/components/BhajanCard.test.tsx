import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BhajanCard from "./BhajanCard";
import { LanguageProvider } from "@/hooks/useLanguage";
import { YouTubePlayerProvider } from "@/hooks/useYouTubePlayer";
import { BhajanModalOpenProvider } from "@/hooks/useBhajanModalOpen";
import type { Bhajan } from "@/data/bhajans";
import { AuthProvider } from "@/hooks/useAuth";

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

function renderCard(onCardClick?: (bhajan: Bhajan) => void) {
  render(
    <AuthProvider>
      <LanguageProvider>
        <YouTubePlayerProvider>
          <BhajanModalOpenProvider>
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<BhajanCard bhajan={testBhajan} onCardClick={onCardClick} />} />
              </Routes>
            </MemoryRouter>
          </BhajanModalOpenProvider>
        </YouTubePlayerProvider>
      </LanguageProvider>
    </AuthProvider>,
  );
}

describe("BhajanCard", () => {
  it("renders bhajan title and calls onCardClick when clicked", () => {
    const handleCardClick = vi.fn();
    renderCard(handleCardClick);

    const heading = screen.getByRole("heading", { name: /Test Hindi Title/i });
    expect(heading).toBeInTheDocument();

    const card = heading.closest('div[tabindex="0"]');
    expect(card).toBeTruthy();
    fireEvent.click(card!);

    expect(handleCardClick).toHaveBeenCalledTimes(1);
    expect(handleCardClick).toHaveBeenCalledWith(testBhajan);
  });
});
