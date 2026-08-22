export async function handleShareSavedPoster(url: string, index: number): Promise<void> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], `Blessing_${index}.png`, { type: "image/png" });
    if (navigator.share) {
      await navigator.share({ files: [file] });
    } else {
      const link = document.createElement("a");
      link.download = `Sadhana_Blessing_${index}.png`;
      link.href = url;
      link.click();
    }
  } catch (_) {
    /* ignore share error */
  }
}

export function formatDeityName(deity: string, isHi: boolean): string {
  if (!isHi) return deity;
  switch (deity) {
    case "Shiva":
      return "शिव";
    case "Rama":
      return "राम";
    case "Krishna":
      return "कृष्ण";
    case "Hanuman":
      return "हनुमान";
    case "Radha":
      return "राधा";
    default:
      return deity;
  }
}
