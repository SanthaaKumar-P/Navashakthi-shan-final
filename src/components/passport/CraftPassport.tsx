import { ShieldCheck, Sparkles, Download } from "lucide-react";
import logo from "@/assets/logo.png";

export interface PassportData {
  id: string; name: string; artisan: string; village: string; district: string; state: string;
  category: string; handmadeScore: number; authenticity: number; aiStatus: string;
  craftmark: boolean; twinId: string; govStatus: string; date: string;
  material: string; buildTime: string; technique: string; impact: string; story: string;
  image?: string;
}

export function CraftPassport({ data, onDownload }: { data: PassportData; onDownload?: () => void }) {
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border-2 border-gold/40 bg-cream shadow-elegant">
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-12 rounded-full bg-white/20 p-1" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">Government of India · Verified</div>
              <div className="font-display text-2xl">Digital Craft Passport</div>
            </div>
          </div>
          <div className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
            #{data.id}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[1fr_2fr]">
        {data.image && (
          <img src={data.image} alt="" className="aspect-square w-full rounded-2xl object-cover" />
        )}
        <div>
          <div className="font-display text-3xl leading-tight text-earth">{data.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{data.category} · {data.technique}</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Row k="Artisan" v={data.artisan} />
            <Row k="Village" v={data.village} />
            <Row k="District" v={data.district} />
            <Row k="State" v={data.state} />
            <Row k="Material" v={data.material} />
            <Row k="Build time" v={data.buildTime} />
            <Row k="Impact" v={data.impact} />
            <Row k="Issued" v={data.date} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-gold/30 bg-white/50 p-6">
        <Score label="Handmade" value={data.handmadeScore} />
        <Score label="Authenticity" value={data.authenticity} />
        <Score label="Twin ID" text={data.twinId.slice(0, 12) + "…"} />
      </div>

      <div className="border-t border-gold/30 p-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Story of the craft</div>
        <p className="mt-2 text-sm leading-relaxed text-earth">{data.story}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/30 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">{data.aiStatus}</span>
          <span className="text-muted-foreground">· {data.govStatus}</span>
          {data.craftmark && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-semibold text-earth"><Sparkles className="h-3 w-3" /> Craftmark</span>}
        </div>
        <button onClick={onDownload} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          <Download className="h-4 w-4" /> Download Passport
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm text-earth">{v}</div>
    </div>
  );
}
function Score({ label, value, text }: { label: string; value?: number; text?: string }) {
  return (
    <div className="rounded-2xl border border-gold/40 bg-cream p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl text-primary">{text ?? `${value}%`}</div>
    </div>
  );
}
