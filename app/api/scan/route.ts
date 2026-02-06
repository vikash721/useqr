import { NextResponse } from "next/server";
import { recordScan, isValidQrId } from "@/lib/scan-store";

export async function POST(request: Request) {
  let body: { qrId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const qrId = body.qrId;
  if (!isValidQrId(qrId)) {
    return NextResponse.json(
      { error: "Invalid or missing qrId" },
      { status: 400 }
    );
  }
  recordScan(qrId);
  return NextResponse.json({ ok: true }, { status: 200 });
}
