// Shrinks a photo in the browser before upload (phone photos are 5–10 MB).
export type ResizedImage = { blob: Blob; width: number; height: number };

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function resizeImage(file: File, maxSize: number, quality: number): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Browsers that can't encode WebP (older Safari) return PNG instead, so fall back to JPEG.
  let blob = await encode(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg", quality);
  if (!blob) throw new Error("Nepavyko apdoroti nuotraukos");

  return { blob, width, height };
}
