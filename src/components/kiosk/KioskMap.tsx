// India map with kiosk markers


export interface Kiosk { id: string; name: string; state: string; x: number; y: number; live: boolean }

// Coordinates below are tuned to a viewBox of 0 0 500 600 (India silhouette)
export const KIOSKS: Kiosk[] = [
  { id: "k1",  name: "Jaipur Village Centre",     state: "Rajasthan",     x: 175, y: 200, live: true },
  { id: "k2",  name: "Kanchipuram Kiosk",         state: "Tamil Nadu",    x: 245, y: 470, live: true },
  { id: "k3",  name: "Bhuj Craft Hub",            state: "Gujarat",       x: 115, y: 235, live: true },
  { id: "k4",  name: "Majuli Bamboo Kiosk",       state: "Assam",         x: 415, y: 210, live: true },
  { id: "k5",  name: "Channapatna Wood Studio",   state: "Karnataka",     x: 210, y: 430, live: false },
  { id: "k6",  name: "Swamimalai Bronze Kiosk",   state: "Tamil Nadu",    x: 235, y: 495, live: true },
  { id: "k7",  name: "Mahabalipuram Stone Kiosk", state: "Tamil Nadu",    x: 255, y: 480, live: true },
  { id: "k8",  name: "Varanasi Handloom Hub",     state: "Uttar Pradesh", x: 280, y: 220, live: true },
  { id: "k9",  name: "Srinagar Pashmina Kiosk",   state: "J&K",           x: 175, y: 90,  live: true },
  { id: "k10", name: "Puri Pattachitra Centre",   state: "Odisha",        x: 320, y: 320, live: true },
];

// Stylised but recognisable India silhouette (viewBox 500x600)
const INDIA_PATH =
  "M175,70 C185,55 210,55 225,70 L245,95 C255,105 265,110 285,110 L320,115 C335,120 340,135 355,140 L390,155 C405,160 420,175 425,190 L440,195 C455,200 465,215 460,230 L455,245 C445,255 430,245 420,240 L405,235 L395,240 C390,255 400,265 400,280 L395,300 C385,305 375,300 365,290 L355,285 L360,300 C368,320 355,335 340,335 L325,335 L335,355 C340,375 320,380 305,375 L285,365 L295,395 C305,425 320,455 315,485 L305,515 C295,540 275,555 260,545 L245,530 L235,545 C225,555 215,545 210,530 L200,510 C185,485 175,450 175,420 L170,390 C165,365 155,340 145,315 L130,295 C115,275 100,255 95,235 L85,215 C75,200 70,180 80,165 L100,150 C115,140 130,135 145,130 L155,120 C160,105 165,85 175,70 Z";

export function KioskMap({ onSelect, selected }: { onSelect?: (k: Kiosk) => void; selected?: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-cream via-background to-gold/10 p-4">
      <svg viewBox="0 0 500 600" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="indiaFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--clay)" stopOpacity="0.12" />
          </linearGradient>
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0B5D50" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* subtle grid */}
        <g opacity="0.08" stroke="currentColor" strokeWidth="0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 60} x2="500" y2={i * 60} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="600" />
          ))}
        </g>

        {/* India shape */}
        <path
          d={INDIA_PATH}
          fill="url(#indiaFill)"
          stroke="var(--primary)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#mapShadow)"
        />

        {/* Sri Lanka */}
        <ellipse cx="270" cy="565" rx="14" ry="20" fill="url(#indiaFill)" stroke="var(--primary)" strokeWidth="1.4" opacity="0.9" />

        {/* Kiosk markers */}
        {KIOSKS.map((k) => {
          const isActive = selected === k.id;
          return (
            <g
              key={k.id}
              transform={`translate(${k.x}, ${k.y})`}
              className="cursor-pointer"
              onClick={() => onSelect?.(k)}
            >
              {k.live && (
                <circle r="14" fill="var(--primary)" opacity="0.35">
                  <animate attributeName="r" values="8;18;8" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0;0.45" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                r={isActive ? 11 : 7}
                fill={k.live ? "var(--primary)" : "var(--muted-foreground)"}
                stroke="white"
                strokeWidth="2"
                className="transition-all"
              />
              {isActive && (
                <circle r="14" fill="none" stroke="var(--gold)" strokeWidth="2" />
              )}
              <text
                x="0"
                y={isActive ? -18 : -12}
                textAnchor="middle"
                className="pointer-events-none"
                style={{ fontSize: isActive ? 11 : 9, fontWeight: 600, fill: "var(--earth)" }}
              >
                {isActive ? k.name : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-semibold backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Live
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Offline
        </span>
      </div>
    </div>
  );
}

