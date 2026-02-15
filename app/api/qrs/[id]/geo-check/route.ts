import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getQRById } from "@/lib/db/qrs";
import { haversineDistance } from "@/lib/geo/haversine";
import { checkRateLimit } from "@/lib/rate-limit";

type GeoLock = {
    lat: number;
    lng: number;
    radiusMeters: number;
};

/**
 * POST /api/qrs/[id]/geo-check
 * Validates whether a scanner's location is within the allowed geo-lock radius.
 *
 * Body: { lat: number, lng: number }
 * Response: { allowed: boolean }
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Rate limit: 30 checks per minute per IP
    const headersList = await headers();
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

    const rl = checkRateLimit(`geo:${ip}`, 30, 60_000);
    if (!rl) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    // Parse body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const { lat, lng } = body as { lat?: unknown; lng?: unknown };
    if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180 ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return NextResponse.json(
            { error: "Invalid coordinates. lat: -90..90, lng: -180..180" },
            { status: 400 }
        );
    }

    // Fetch QR
    const qr = await getQRById(id);
    if (!qr) {
        return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }

    // Check geo lock
    const geoLock = (qr.metadata as Record<string, unknown> | undefined)?.geoLock as GeoLock | undefined;
    if (!geoLock) {
        // Not geo-locked → always allow
        return NextResponse.json({ allowed: true });
    }

    const distance = haversineDistance(geoLock.lat, geoLock.lng, lat, lng);
    const allowed = distance <= geoLock.radiusMeters;

    return NextResponse.json({ allowed });
}
