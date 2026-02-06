import { isValidQrId } from "@/lib/scan-store";
import CardThankYou from "./CardThankYou";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  if (!id || !isValidQrId(id)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <p className="text-center text-zinc-400">Invalid link.</p>
      </div>
    );
  }
  return <CardThankYou qrId={id} />;
}
