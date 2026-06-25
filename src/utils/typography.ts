/**
 * Multilingual Typography Helpers
 */

/**
 * Get language-aware font family string
 */
export const getFontFamily = (lang: string): string => {
  switch (lang) {
    case 'hi':
    case 'mr':
      return "'Noto Sans Devanagari', sans-serif";
    case 'gu':
      return "'Noto Sans Gujarati', sans-serif";
    case 'bn':
      return "'Noto Sans Bengali', sans-serif";
    case 'ta':
      return "'Noto Sans Tamil', sans-serif";
    default:
      return "'Inter', sans-serif";
  }
};

/**
 * Get specific font styles for headings
 */
export const getHeadingStyle = (lang: string) => {
  if (lang === 'hi' || lang === 'mr') {
    return {
      fontFamily: "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif",
      fontWeight: '700',
      letterSpacing: '0em',
      lineHeight: '1.3',
    };
  }
  const isIndian = ['hi', 'mr', 'gu', 'bn', 'ta'].includes(lang);
  return {
    fontFamily: isIndian ? getFontFamily(lang) : "'Faculty Glyphic', sans-serif",
    fontWeight: isIndian ? '800' : '800',
    letterSpacing: isIndian ? '0em' : '-0.02em',
    lineHeight: isIndian ? '1.3' : '1.2',
  };
};

/**
 * Get specific font styles for body text
 */
export const getBodyStyle = (lang: string) => {
  const isIndian = ['hi', 'mr', 'gu', 'bn', 'ta'].includes(lang);
  return {
    fontFamily: getFontFamily(lang),
    fontWeight: isIndian ? '500' : '400',
    letterSpacing: isIndian ? '0em' : 'normal',
    lineHeight: isIndian ? '1.4' : '1.5',
  };
};

/**
 * Resolve canvas-compatible font string with optimal font weights and style configuration
 */
export const getCanvasFont = (
  lang: string,
  size: number,
  type: 'heading' | 'quote' | 'body' | 'watermark',
  isBold: boolean = false
): string => {
  if (lang === 'en') {
    if (type === 'heading') return `${isBold ? 'bold' : 'normal'} ${size}px 'Faculty Glyphic', sans-serif`;
    if (type === 'quote') return `italic ${size}px 'Inter', sans-serif`;
    if (type === 'watermark') return `bold ${size}px sans-serif`;
    return `${isBold ? 'bold' : 'normal'} ${size}px 'Inter', sans-serif`;
  }

  if (lang === 'hi' || lang === 'mr') {
    if (type === 'heading') return `${isBold ? 'bold' : 'normal'} ${size}px 'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif`;
    if (type === 'quote') return `normal 500 ${size}px 'Noto Sans Devanagari', sans-serif`;
    return `${isBold ? 'bold' : 'normal'} ${size}px 'Noto Sans Devanagari', sans-serif`;
  }

  const fontName = getFontFamily(lang).split(',')[0];
  const weight = isBold || type === 'heading' ? '700' : '500';
  const style = type === 'quote' ? 'italic' : 'normal';
  return `${style} ${weight} ${size}px ${fontName}, sans-serif`;
};

interface WrappedLine {
  text: string;
  y: number;
}

/**
 * Word wraps text for canvas drawing and automatically computes language-adjusted vertical spacing
 */
export const wrapTextAndGetLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startY: number,
  baseLineHeight: number,
  lang: string
): WrappedLine[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? " " : "") + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const isIndian = ['hi', 'mr', 'gu', 'bn', 'ta'].includes(lang);
  const lineSpacingMultiplier = isIndian ? 1.25 : 1.05;
  const adjustedLineHeight = baseLineHeight * lineSpacingMultiplier;

  return lines.map((line, index) => ({
    text: line,
    y: startY + (index * adjustedLineHeight)
  }));
};

/**
 * Automatically shrinks the font size of a text block until it fits within maxWidth.
 * Returns the final context-compatible font string.
 */
export const fitTextToWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialFontSize: number,
  fontFamily: string,
  fontWeight: string = 'normal',
  minFontSize: number = 14
): string => {
  let fontSize = initialFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
    fontSize--;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  return `${fontWeight} ${fontSize}px ${fontFamily}`;
};

/**
 * Wraps text and offsets line vertical coordinates to center the entire text block around centerY.
 */
export const fitMultiLineText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  centerY: number,
  baseLineHeight: number,
  lang: string,
  fontString: string,
  maxLines: number = 3
): WrappedLine[] => {
  ctx.font = fontString;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? " " : "") + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const finalLines = lines.slice(0, maxLines);
  const isIndian = ['hi', 'mr', 'gu', 'bn', 'ta'].includes(lang);
  const lineSpacingMultiplier = isIndian ? 1.25 : 1.05;
  const adjustedLineHeight = baseLineHeight * lineSpacingMultiplier;

  const totalHeight = finalLines.length * adjustedLineHeight;
  const startY = centerY - (totalHeight / 2) + (adjustedLineHeight / 2);

  return finalLines.map((line, index) => ({
    text: line,
    y: startY + (index * adjustedLineHeight)
  }));
};

export interface PosterTypography {
  titleFont: string;
  subtitleFont: string;
  quoteFont: string;
  nameFont: string;
  titleSize: number;
  subtitleSize: number;
  quoteSize: number;
  nameSize: number;
  lineHeight: number;
}

/**
 * Returns premium target sizes, families, and weights for poster overlays
 */
export const getPosterTypography = (
  lang: string,
  aspect: 'square' | 'vertical',
  isPoster: boolean = true
): PosterTypography => {
  const isSquare = aspect === 'square';
  
  // English Defaults
  const config: PosterTypography = {
    titleFont: "'Faculty Glyphic', sans-serif",
    subtitleFont: "'Inter', sans-serif",
    quoteFont: "'Inter', sans-serif",
    nameFont: "'Inter', sans-serif",
    titleSize: isSquare ? 46 : (isPoster ? 60 : 52),
    subtitleSize: isSquare ? 26 : 34,
    quoteSize: isSquare ? 26 : 34,
    nameSize: isSquare ? 42 : 56,
    lineHeight: isSquare ? 36 : 48,
  };

  // Hindi & Marathi Custom Override
  if (lang === 'hi' || lang === 'mr') {
    config.titleFont = "'Tiro Devanagari Hindi', 'Noto Sans Devanagari', serif";
    config.subtitleFont = "'Noto Sans Devanagari', sans-serif";
    config.quoteFont = "'Noto Sans Devanagari', sans-serif";
    config.nameFont = "'Noto Sans Devanagari', sans-serif";
  } else if (lang === 'gu') {
    config.titleFont = "'Noto Sans Gujarati', sans-serif";
    config.subtitleFont = "'Noto Sans Gujarati', sans-serif";
    config.quoteFont = "'Noto Sans Gujarati', sans-serif";
    config.nameFont = "'Noto Sans Gujarati', sans-serif";
  } else if (lang === 'bn') {
    config.titleFont = "'Noto Sans Bengali', sans-serif";
    config.subtitleFont = "'Noto Sans Bengali', sans-serif";
    config.quoteFont = "'Noto Sans Bengali', sans-serif";
    config.nameFont = "'Noto Sans Bengali', sans-serif";
  } else if (lang === 'ta') {
    config.titleFont = "'Noto Sans Tamil', sans-serif";
    config.subtitleFont = "'Noto Sans Tamil', sans-serif";
    config.quoteFont = "'Noto Sans Tamil', sans-serif";
    config.nameFont = "'Noto Sans Tamil', sans-serif";
  }

  return config;
};
