import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RotateCw, Move3d, ZoomIn } from "lucide-react";

/**
 * Interactive 3D twin viewer.
 * - Auto-rotates when idle
 * - Drag to spin
 * - Hover tilts on 3D plane
 * - Zoom slider
 */
export function TwinViewer({ src, alt, twinId }: { src: string; alt: string; twinId?: string }) {
  const rotY = useMotionValue(0);
  const rotX = useMotionValue(-8);
  const scale = useMotionValue(1);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const idleRef = useRef<ReturnType<typeof animate> | null>(null);

  // idle auto-rotate
  useEffect(() => {
    if (dragging) {
      idleRef.current?.stop();
      return;
    }
    const from = rotY.get();
    const controls = animate(rotY, from + 360, {
      duration: 22,
      repeat: Infinity,
      ease: "linear",
    });
    idleRef.current = controls;
    return () => controls.stop();
  }, [dragging, rotY]);

  useEffect(() => {
    animate(scale, zoom, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
  }, [zoom, scale]);

  const shadow = useTransform(rotY, (v) => {
    const t = Math.sin((v * Math.PI) / 180);
    return `${t * 30}px 40px 60px rgba(11,93,80,0.35)`;
  });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    rotY.set(rotY.get() + e.movementX * 0.6);
    rotX.set(Math.max(-25, Math.min(25, rotX.get() - e.movementY * 0.4)));
  };

  return (
    <div className="relative">
      <div
        className="relative mx-auto aspect-square w-full max-w-md select-none rounded-3xl border border-border/60 bg-gradient-to-br from-cream via-background to-primary/5 p-6"
        style={{ perspective: 1200 }}
      >
        {/* stage lights */}
        <div className="pointer-events-none absolute inset-8 rounded-full bg-gradient-radial from-gold/25 via-transparent to-transparent blur-2xl" />

        <motion.div
          onPointerDown={(e) => {
            setDragging(true);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerUp={(e) => {
            setDragging(false);
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
          }}
          onPointerMove={handlePointerMove}
          style={{
            rotateX: rotX,
            rotateY: rotY,
            scale,
            transformStyle: "preserve-3d",
            boxShadow: shadow,
          }}
          className="relative mx-auto h-full w-full cursor-grab overflow-hidden rounded-2xl bg-black/5 active:cursor-grabbing"
        >
          <img src={src} alt={alt} className="pointer-events-none h-full w-full object-cover" draggable={false} />
          {/* reflective sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 mix-blend-overlay" />
          {/* fake back plate for depth */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20"
            style={{ transform: "translateZ(-40px)", background: "rgba(11,93,80,0.15)" }}
          />
        </motion.div>

        {/* HUD */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-earth/85 px-3 py-1 text-[10px] font-semibold tracking-widest text-cream">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> 3D DIGITAL TWIN
        </div>
        {twinId && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[10px] font-mono font-semibold text-earth backdrop-blur">
            {twinId}
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-full bg-background/85 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
            <Move3d className="h-3.5 w-3.5" /> Drag to rotate
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="range"
              min={0.7}
              max={1.6}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="accent-primary"
            />
          </div>
          <button
            onClick={() => {
              rotX.set(-8);
              animate(rotY, 0, { duration: 0.6 });
              setZoom(1);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"
          >
            <RotateCw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
