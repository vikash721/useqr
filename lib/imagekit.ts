/**
 * ImageKit upload helper — server-side only.
 * Use for logo and other image uploads; returns a public URL for use in QR style, etc.
 */

import ImageKit from "@imagekit/nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadImageOptions = {
  /** Folder path in ImageKit (e.g. useqr/logos). Default: useqr/logos */
  folder?: string;
  /** Optional custom fileName (will get unique suffix if useUniqueFileName). */
  fileName?: string;
};

export type UploadImageResult = {
  url: string;
  fileId: string;
  filePath: string;
};

/**
 * Returns an ImageKit client when IMAGEKIT_PRIVATE_KEY is set.
 * Use only on the server (e.g. in API routes).
 */
export function getImageKitClient(): ImageKit | null {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey?.trim()) return null;
  return new ImageKit({
    privateKey: privateKey.trim(),
  });
}

/**
 * Upload an image to ImageKit and return its public URL.
 * Use from API routes only (requires IMAGEKIT_PRIVATE_KEY).
 *
 * @param file - File from multipart/form-data (Web File API)
 * @param fileName - Safe name with extension (e.g. logo.png)
 * @param options - folder, optional fileName override
 * @returns { url, fileId, filePath }
 */
export async function uploadImage(
  file: File,
  fileName: string,
  options?: UploadImageOptions
): Promise<UploadImageResult> {
  const client = getImageKitClient();
  if (!client) {
    throw new Error("ImageKit is not configured (IMAGEKIT_PRIVATE_KEY missing)");
  }

  const folder = options?.folder ?? "useqr/logos";
  const name = (options?.fileName ?? fileName).replace(/[^a-zA-Z0-9.-]/g, "_");

  const result = await client.files.upload({
    file,
    fileName: name,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: result.url!,
    fileId: result.fileId!,
    filePath: result.filePath!,
  };
}

/**
 * Check if a given MIME type is allowed for upload.
 */
export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mimeType.toLowerCase());
}

/**
 * Max allowed file size in bytes for image uploads.
 */
export function getMaxUploadSizeBytes(): number {
  return MAX_SIZE_BYTES;
}
