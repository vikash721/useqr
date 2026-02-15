"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Loader2,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CroppedResult = {
  blob: Blob;
  url: string; // object URL — caller must revoke
};

export type ImageCropModalProps = {
  /** The raw File the user selected */
  file: File | null;
  /** Called when user confirms crop */
  onConfirm: (result: CroppedResult) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Output size in px (square). Default 512 */
  outputSize?: number;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;
const ROTATION_STEP = 90;
const CANVAS_SIZE = 360; // display canvas size

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ImageCropModal({
  file,
  onConfirm,
  onCancel,
  outputSize = 512,
}: ImageCropModalProps) {
  /* ---------- state ---------- */
  const [visible, setVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  /* ---------- load image from File ---------- */
  useEffect(() => {
    if (!file) {
      setVisible(false);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSrc(url);
      setZoom(0.6);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPanX(0);
      setPanY(0);
      setBrightness(100);
      setContrast(100);
      // Animate in
      requestAnimationFrame(() => setVisible(true));
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* ---------- draw on canvas ---------- */
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;

    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;
    ctx.clearRect(0, 0, w, h);

    // Checkerboard background (transparency indicator)
    const sqSize = 12;
    for (let y = 0; y < h; y += sqSize) {
      for (let x = 0; x < w; x += sqSize) {
        ctx.fillStyle =
          (Math.floor(x / sqSize) + Math.floor(y / sqSize)) % 2 === 0
            ? "#2a2a2a"
            : "#222";
        ctx.fillRect(x, y, sqSize, sqSize);
      }
    }

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Fit image into canvas keeping aspect ratio then apply pan
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;

    ctx.drawImage(img, -dw / 2 + panX, -dh / 2 + panY, dw, dh);
    ctx.restore();

    // Draw crop overlay (darken outside the center circle / square region)
    // Semi-transparent mask outside the circle
    ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
    ctx.fillRect(0, 0, w, h);

    // Cut out rounded-square crop area
    const cropSize = Math.min(w, h) * 0.78;
    const cx = w / 2;
    const cy = h / 2;
    const r = cropSize * 0.1; // border radius
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.roundRect(cx - cropSize / 2, cy - cropSize / 2, cropSize, cropSize, r);
    ctx.fill();
    ctx.restore();

    // Crop border
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - cropSize / 2, cy - cropSize / 2, cropSize, cropSize, r);
    ctx.stroke();

    // Corner marks
    const markLen = 16;
    const corners = [
      [cx - cropSize / 2, cy - cropSize / 2],
      [cx + cropSize / 2, cy - cropSize / 2],
      [cx + cropSize / 2, cy + cropSize / 2],
      [cx - cropSize / 2, cy + cropSize / 2],
    ];
    ctx.strokeStyle = "rgba(16, 185, 129, 1)";
    ctx.lineWidth = 3;
    corners.forEach(([cxc, cyc], i) => {
      const dx = i === 0 || i === 3 ? 1 : -1;
      const dy = i < 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(cxc + dx * markLen, cyc);
      ctx.lineTo(cxc, cyc);
      ctx.lineTo(cxc, cyc + dy * markLen);
      ctx.stroke();
    });
  }, [zoom, rotation, flipH, flipV, panX, panY, brightness, contrast, imgSrc]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* ---------- drag / pan handling ---------- */
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const onPointerUp = () => setDragging(false);

  /* ---------- zoom via wheel ---------- */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.002))
    );
  };

  /* ---------- produce cropped blob ---------- */
  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);

    const offscreen = document.createElement("canvas");
    offscreen.width = outputSize;
    offscreen.height = outputSize;
    const ctx = offscreen.getContext("2d")!;

    // Replicate the same transform as preview, but at output resolution
    const scale = outputSize / CANVAS_SIZE;
    const cropFraction = 0.78;

    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;
    const imgScale = Math.min(w / img.width, h / img.height);
    const dw = img.width * imgScale * scale;
    const dh = img.height * imgScale * scale;

    // Pan is scaled up proportionally
    ctx.drawImage(
      img,
      -dw / 2 + panX * scale,
      -dh / 2 + panY * scale,
      dw,
      dh
    );
    ctx.restore();

    // Clip to crop area
    const cropSize = outputSize * cropFraction;
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = outputSize;
    finalCanvas.height = outputSize;
    const fCtx = finalCanvas.getContext("2d")!;

    fCtx.drawImage(
      offscreen,
      (outputSize - cropSize) / 2,
      (outputSize - cropSize) / 2,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    finalCanvas.toBlob(
      (blob) => {
        setProcessing(false);
        if (!blob) return;
        onConfirm({ blob, url: URL.createObjectURL(blob) });
      },
      "image/png",
      1
    );
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onCancel, 250);
  };

  const resetEdits = () => {
    setZoom(0.6);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanX(0);
    setPanY(0);
    setBrightness(100);
    setContrast(100);
  };

  if (!file || !imgSrc) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-250",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 transition-all duration-250",
          visible
            ? "-translate-y-1/2 scale-100 opacity-100"
            : "-translate-y-[45%] scale-95 opacity-0"
        )}
      >
        <div className="relative mx-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
            <h2 className="text-base font-semibold text-white">
              Edit image
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Canvas area */}
          <div className="relative flex items-center justify-center bg-zinc-950 px-4 py-5">
            <div className="relative overflow-hidden rounded-xl">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="block cursor-move touch-none"
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  maxWidth: "100%",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onWheel={onWheel}
              />
              {/* Drag hint */}
              <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] text-zinc-400 backdrop-blur-sm">
                <Move className="size-3" />
                Drag to reposition
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 border-t border-white/5 px-5 py-4">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP * 3))}
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ZoomOut className="size-4" />
              </button>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500
                  [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP * 3))}
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ZoomIn className="size-4" />
              </button>
              <span className="w-12 text-right text-xs font-medium text-zinc-400">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Transform buttons */}
            <div className="flex items-center gap-1">
              <ToolButton
                icon={<RotateCcw className="size-4" />}
                label="Rotate left"
                onClick={() => setRotation((r) => r - ROTATION_STEP)}
              />
              <ToolButton
                icon={<RotateCw className="size-4" />}
                label="Rotate right"
                onClick={() => setRotation((r) => r + ROTATION_STEP)}
              />
              <div className="mx-1 h-5 w-px bg-zinc-700" />
              <ToolButton
                icon={<FlipHorizontal className="size-4" />}
                label="Flip horizontal"
                onClick={() => setFlipH((f) => !f)}
                active={flipH}
              />
              <ToolButton
                icon={<FlipVertical className="size-4" />}
                label="Flip vertical"
                onClick={() => setFlipV((f) => !f)}
                active={flipV}
              />
              <div className="mx-1 h-5 w-px bg-zinc-700" />

              <button
                type="button"
                onClick={resetEdits}
                className="ml-auto rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                Reset
              </button>
            </div>

            {/* Brightness & Contrast */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                  Brightness
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500
                    [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                  Contrast
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500
                    [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-white/5 px-5 py-3.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={processing}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all  disabled:opacity-60"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Apply & Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool button (internal)                                             */
/* ------------------------------------------------------------------ */

function ToolButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-2 transition-colors",
        active
          ? "bg-emerald-500/15 text-emerald-400"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      )}
    >
      {icon}
    </button>
  );
}
