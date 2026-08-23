/**
 * cropImage.ts
 *
 * Canvas helper utility to crop/zoom images based on react-easy-crop pixel coordinates.
 */

import { compressCanvasToCommunityFile } from "@/lib/compressCommunityImage";

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Returns a cropped, compressed image File and object URL.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  _rotation = 0
): Promise<{ file: File; url: string; originalBytes: number }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const uncompressedApprox = canvas.width * canvas.height * 3;
  const file = await compressCanvasToCommunityFile(canvas, `cropped_${Date.now()}`);
  const url = URL.createObjectURL(file);
  return { file, url, originalBytes: uncompressedApprox };
}
