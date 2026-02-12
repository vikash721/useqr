import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  uploadImage,
  isAllowedImageType,
  getMaxUploadSizeBytes,
} from "@/lib/imagekit";

/**
 * POST /api/upload
 * Upload an image (e.g. logo) to ImageKit. Auth required.
 * Body: multipart/form-data with field "file" (image).
 * Returns { url, fileId?, filePath? }.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.IMAGEKIT_PRIVATE_KEY?.trim()) {
    return NextResponse.json(
      { error: "Image upload is not configured" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid file (expected multipart field 'file')" },
      { status: 400 }
    );
  }

  const mimeType = file.type || "";
  if (!isAllowedImageType(mimeType)) {
    return NextResponse.json(
      {
        error: "Invalid file type. Allowed: PNG, JPEG, WebP, GIF.",
      },
      { status: 400 }
    );
  }

  const maxSize = getMaxUploadSizeBytes();
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)} MB`,
      },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)
    ? ext
    : "png";
  const fileName = `logo-${Date.now()}.${safeExt}`;

  try {
    const result = await uploadImage(file, fileName, {
      folder: "useqr/logos",
    });
    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      filePath: result.filePath,
    });
  } catch (err) {
    console.error("[upload] ImageKit upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
