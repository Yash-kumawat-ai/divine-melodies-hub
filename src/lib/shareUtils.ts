import { getPublicSiteUrl } from './env';

export interface Bhajan {
  id: number | string;
  slug: string;
  title: string;
  titleHindi: string;
  singerName: string;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return getPublicSiteUrl();
};

const getBhajanUrl = (bhajan: Bhajan) => {
  return `${getBaseUrl()}/bhajan/${bhajan.slug}`;
};

const getShareText = (bhajan: Bhajan) => {
  return `🙏 Listen to "${bhajan.title}" (${bhajan.titleHindi}) by ${bhajan.singerName}`;
};

/**
 * Share on WhatsApp
 */
export const shareOnWhatsApp = (bhajan: Bhajan) => {
  const text = encodeURIComponent(`${getShareText(bhajan)}\n${getBhajanUrl(bhajan)}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share on Telegram
 */
export const shareOnTelegram = (bhajan: Bhajan) => {
  const text = encodeURIComponent(`${getShareText(bhajan)}\n${getBhajanUrl(bhajan)}`);
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getBhajanUrl(bhajan))}&text=${text}`;
  window.open(telegramUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share via Email
 */
export const shareViaEmail = (bhajan: Bhajan) => {
  const subject = encodeURIComponent(`Check out this beautiful bhajan: ${bhajan.title}`);
  const body = encodeURIComponent(
    `I found this beautiful bhajan that I thought you might enjoy:\n\n"${bhajan.title}" (${bhajan.titleHindi})\nSinger: ${bhajan.singerName}\n\nListen here: ${getBhajanUrl(bhajan)}\n\n🙏 Enjoy!`
  );
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Copy share link to clipboard
 */
export const copyShareLink = async (bhajan: Bhajan): Promise<boolean> => {
  try {
    const url = getBhajanUrl(bhajan);
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};

/**
 * Get social share URLs (for direct use if needed)
 */
export const getShareUrls = (bhajan: Bhajan) => {
  const shareText = getShareText(bhajan);
  const bhajanUrl = getBhajanUrl(bhajan);

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${bhajanUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(bhajanUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out: ${bhajan.title}`)}&body=${encodeURIComponent(`${shareText}\n${bhajanUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bhajanUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(bhajanUrl)}`,
  };
};
