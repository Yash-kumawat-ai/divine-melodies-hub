import { toast } from "sonner";

export interface ShareWallpaperOptions {
  url: string;
  title: string;
  text: string;
  isHi: boolean;
}

export async function shareWallpaper({
  url,
  title,
  text,
  isHi,
}: ShareWallpaperOptions): Promise<void> {
  // Construct absolute URL if relative
  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;

  const shareData = {
    title: title || "Raghavam Wallpaper",
    text: text ? `${title} - ${text}` : title,
    url: fullUrl,
  };

  // Try Web Share API (native mobile share sheet)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err: any) {
      // If user cancelled, don't show error; if failed, fall through to clipboard copy
      if (err?.name === "AbortError") return;
    }
  }

  // Fallback: Copy absolute URL to clipboard
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(fullUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    toast.success(isHi ? "लिंक कॉपी हो गया!" : "Link copied to clipboard!", {
      description: isHi ? "आप इसे व्हाट्सएप या सोशल मीडिया पर साझा कर सकते हैं।" : "You can paste & share it anywhere on WhatsApp or social media.",
      duration: 3000,
      action: {
        label: "WhatsApp",
        onClick: () => {
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${fullUrl}`)}`;
          window.open(waUrl, "_blank");
        },
      },
    });
  } catch (_) {
    // Direct WhatsApp share fallback if clipboard copy is blocked
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${fullUrl}`)}`;
    window.open(waUrl, "_blank");
  }
}
