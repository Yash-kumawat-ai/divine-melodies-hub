import { getPublicSiteUrl } from './env';
import { getCanonicalUrl, type ContentItemLike } from './contentUrls';

export interface ShareableBhajan extends ContentItemLike {
  id?: number | string;
  slug?: string;
  title?: string;
  titleHindi?: string;
  singerName?: string;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return getPublicSiteUrl();
};

export const getBhajanUrl = (bhajan: ShareableBhajan): string => {
  return getCanonicalUrl(bhajan, getBaseUrl());
};

const getShareText = (bhajan: ShareableBhajan) => {
  const title = bhajan.title || 'Devotional Song';
  const hindi = bhajan.titleHindi ? ` (${bhajan.titleHindi})` : '';
  const singer = bhajan.singerName ? ` by ${bhajan.singerName}` : '';
  return `🙏 Listen to "${title}"${hindi}${singer}`;
};

/**
 * Share on WhatsApp
 */
export const shareOnWhatsApp = (bhajanOrText: ShareableBhajan | string, optionalUrl?: string) => {
  let text = '';
  if (typeof bhajanOrText === 'string') {
    text = optionalUrl ? `${bhajanOrText}\n${optionalUrl}` : bhajanOrText;
  } else {
    text = `${getShareText(bhajanOrText)}\n${getBhajanUrl(bhajanOrText)}`;
  }
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share on Telegram
 */
export const shareOnTelegram = (bhajanOrText: ShareableBhajan | string, optionalUrl?: string) => {
  let text = '';
  let url = '';
  if (typeof bhajanOrText === 'string') {
    text = bhajanOrText;
    url = optionalUrl || window.location.href;
  } else {
    text = getShareText(bhajanOrText);
    url = getBhajanUrl(bhajanOrText);
  }
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(telegramUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share via Email
 */
export const shareViaEmail = (bhajanOrText: ShareableBhajan | string, optionalUrl?: string) => {
  let subject = '';
  let body = '';
  if (typeof bhajanOrText === 'string') {
    subject = encodeURIComponent(`Check out this devotional song: ${bhajanOrText}`);
    body = encodeURIComponent(`Listen here: ${optionalUrl || window.location.href}\n\n🙏 Enjoy!`);
  } else {
    const title = bhajanOrText.title || 'Devotional Song';
    subject = encodeURIComponent(`Check out this beautiful composition: ${title}`);
    body = encodeURIComponent(
      `I found this beautiful devotional composition that I thought you might enjoy:\n\n"${title}" (${bhajanOrText.titleHindi || ''})\nSinger: ${bhajanOrText.singerName || 'Traditional'}\n\nListen here: ${getBhajanUrl(bhajanOrText)}\n\n🙏 Enjoy!`
    );
  }
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Copy share link to clipboard
 */
export const copyShareLink = async (bhajanOrUrl: ShareableBhajan | string): Promise<boolean> => {
  try {
    const url = typeof bhajanOrUrl === 'string' ? bhajanOrUrl : getBhajanUrl(bhajanOrUrl);
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
 * Get social share URLs
 */
export const getShareUrls = (bhajan: ShareableBhajan) => {
  const shareText = getShareText(bhajan);
  const bhajanUrl = getBhajanUrl(bhajan);

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${bhajanUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(bhajanUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out: ${bhajan.title || 'Devotional Song'}`)}&body=${encodeURIComponent(`${shareText}\n${bhajanUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bhajanUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(bhajanUrl)}`,
  };
};
