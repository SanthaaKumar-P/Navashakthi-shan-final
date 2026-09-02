import { lazy, Suspense, useEffect, useState } from "react";
import { Move3d, Pause, Play, RotateCw, Box, Square } from "lucide-react";

const TwinScene = lazy(() => import("./TwinScene"));

/**
 * Real WebGL 3D digital twin viewer (React Three Fiber).
 * - Continuous turntable "3D video" playback
 * - Orbit / drag to rotate, scroll to zoom
 * - Two twin geometries: vessel (cylinder) and panel (flat craft)
 */
export function TwinViewer({ src, alt, twinId }: { src: string; alt: string; twinId?: string }) {
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [shape, setShape] = useState<"cylinder" | "panel">("cylinder");
  const [key, setKey] = useState(0);

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-md select-none overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-cream via-background to-primary/5">
        {mounted ? (
          <Suspense
            fallback={
              <div className="grid h-full w-full place-items-center text-xs font-semibold tracking-widest text-muted-foreground">
                LOADING 3D TWIN…
              </div>
            }
          >
            <TwinScene key={`${key}-${shape}-${src}`} src={src} shape={shape} spinning={spinning} />
          </Suspense>
        ) : (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-earth/85 px-3 py-1 text-[10px] font-semibold tracking-widest text-cream">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> 3D DIGITAL TWIN
        </div>
        {twinId && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[10px] font-mono font-semibold text-earth backdrop-blur">
            {twinId}
          </div>
        )}

        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2 rounded-full bg-background/85 px-3 py-2 backdrop-blur">
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-muted-foreground sm:flex">
            <Move3d className="h-3.5 w-3.5" /> Drag · scroll to zoom
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShape("cylinder")}
              aria-label="Vessel twin"
              className={`grid h-7 w-7 place-items-center rounded-full ${shape === "cylinder" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}
            >
              <Box className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShape("panel")}
              aria-label="Panel twin"
              className={`grid h-7 w-7 place-items-center rounded-full ${shape === "panel" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setSpinning((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-clay px-3 py-1 text-[10px] font-semibold text-cream"
            >
              {spinning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {spinning ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => setKey((k) => k + 1)}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"
            >
              <RotateCw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
