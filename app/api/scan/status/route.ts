import { NextResponse } from "next/server";
import { getScanStatus, isValidQrId } from "@/lib/scan-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qrId = searchParams.get("qrId");
  if (!isValidQrId(qrId)) {
    return NextResponse.json(
      { error: "Invalid or missing qrId" },
      { status: 400 }
    );
  }
  const status = getScanStatus(qrId);
  if (status === null) {
    return NextResponse.json({ error: "Invalid qrId" }, { status: 400 });
  }
  return NextResponse.json(status, { status: 200 });
}
