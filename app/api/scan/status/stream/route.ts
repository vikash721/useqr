import { getScanStatus, isValidQrId, subscribeScan } from "@/lib/scan-store";

function sseMessage(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qrId = searchParams.get("qrId");
  if (!isValidQrId(qrId)) {
    return new Response(JSON.stringify({ error: "Invalid or missing qrId" }), {
      status: 400,
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(sseMessage(data)));
        } catch (_) {}
      };
      const close = () => {
        try {
          controller.close();
        } catch (_) {}
      };

      const status = getScanStatus(qrId!);
      if (status?.scanned) {
        send(status);
        close();
        return;
      }

      const unsubscribe = subscribeScan(qrId!, (payload) => {
        send(payload);
        close();
      });

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Connection: "keep-alive",
    },
  });
}
