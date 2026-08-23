/** Client-side resize + JPEG/WebP compression for community post photos. */

export const COMMUNITY_IMAGE_TARGET_BYTES = 1024 * 1024;
export const COMMUNITY_IMAGE_MAX_PICK_BYTES = 15 * 1024 * 1024;
export const COMMUNITY_IMAGE_MAX_EDGE = 1920;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type, lastModified: Date.now() });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Canvas encode failed"));
        else resolve(blob);
      },
      type,
      quality
    );
  });
}

function scaleCanvasFromImage(
  image: HTMLImageElement | HTMLCanvasElement,
  maxEdge: number
): HTMLCanvasElement {
  const srcW = "naturalWidth" in image ? image.naturalWidth || image.width : image.width;
  const srcH = "naturalHeight" in image ? image.naturalHeight || image.height : image.height;
  const longEdge = Math.max(srcW, srcH);
  const scale = longEdge > maxEdge ? maxEdge / longEdge : 1;
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function encodeUnderCap(canvas: HTMLCanvasElement, baseName: string): Promise<File> {
  let low = 0.55;
  let high = 0.88;
  let bestJpeg: Blob | null = null;

  for (let i = 0; i < 6; i++) {
    const q = (low + high) / 2;
    const blob = await canvasToBlob(canvas, "image/jpeg", q);
    if (blob.size <= COMMUNITY_IMAGE_TARGET_BYTES) {
      bestJpeg = blob;
      low = q;
    } else {
      high = q;
    }
  }

  if (!bestJpeg) {
    bestJpeg = await canvasToBlob(canvas, "image/jpeg", 0.55);
  }

  let webp: Blob | null = null;
  try {
    webp = await canvasToBlob(canvas, "image/webp", 0.78);
  } catch {
    webp = null;
  }

  const jpegFile = blobToFile(bestJpeg, `${baseName}.jpg`, "image/jpeg");
  if (webp && webp.size < bestJpeg.size && webp.size <= COMMUNITY_IMAGE_TARGET_BYTES) {
    return blobToFile(webp, `${baseName}.webp`, "image/webp");
  }
  if (webp && webp.size < bestJpeg.size && bestJpeg.size > COMMUNITY_IMAGE_TARGET_BYTES) {
    return blobToFile(webp, `${baseName}.webp`, "image/webp");
  }
  return jpegFile;
}

export async function compressCanvasToCommunityFile(
  canvas: HTMLCanvasElement,
  baseName = `community_${Date.now()}`
): Promise<File> {
  const scaled =
    Math.max(canvas.width, canvas.height) > COMMUNITY_IMAGE_MAX_EDGE
      ? scaleCanvasFromImage(canvas, COMMUNITY_IMAGE_MAX_EDGE)
      : canvas;
  return encodeUnderCap(scaled, baseName);
}

export async function compressCommunityImage(file: File): Promise<{ file: File; originalBytes: number }> {
  const originalBytes = file.size;
  if (originalBytes > COMMUNITY_IMAGE_MAX_PICK_BYTES) {
    throw new Error("Image is larger than 15MB. Please choose a smaller photo.");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = url;
    });
    const canvas = scaleCanvasFromImage(image, COMMUNITY_IMAGE_MAX_EDGE);
    const compressed = await encodeUnderCap(canvas, `community_${Date.now()}`);
    return { file: compressed, originalBytes };
  } finally {
    URL.revokeObjectURL(url);
  }
}
