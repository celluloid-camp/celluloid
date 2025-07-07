import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// GET /api/sprite-crop?url=...&x=...&y=...&w=...&h=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const x = Number(searchParams.get("x"));
  const y = Number(searchParams.get("y"));
  const w = Number(searchParams.get("w"));
  const h = Number(searchParams.get("h"));

  if (!url || isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
    return new NextResponse("Missing or invalid parameters", { status: 400 });
  }

  // Fetch the sprite image
  const response = await fetch(url);
  if (!response.ok) {
    return new NextResponse("Failed to fetch sprite image", { status: 400 });
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  // Crop the image
  const cropped = await sharp(buffer)
    .extract({ left: x, top: y, width: w, height: h })
    .jpeg()
    .toBuffer();

  return new NextResponse(cropped, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
