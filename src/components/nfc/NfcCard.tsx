import { Radio, ShieldCheck, QrCode } from "lucide-react";
import logo from "@/assets/logo.png";

export interface NfcData {
  photo?: string; name: string; artisanId: string; govId: string; village: string;
  craft: string; issued: string; expiry: string; rating: number; twinStatus: string; passport: string;
}

export function NfcCard({ data }: { data: NfcData }) {
  return (
    <div className="mx-auto aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-earth via-earth/95 to-primary p-5 text-cream shadow-elegant">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8" />
          <div>
            <div className="font-display text-sm">NAVSHAKTHI</div>
            <div className="text-[8px] uppercase tracking-widest opacity-70">Artisan Digital ID · NFC</div>
          </div>
        </div>
        <Radio className="h-5 w-5 text-gold" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 text-lg font-semibold">
          {data.photo ? <img src={data.photo} alt="" className="h-full w-full object-cover" /> : data.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg">{data.name}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">{data.craft} · {data.village}</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-semibold text-gold">
            <ShieldCheck className="h-2.5 w-2.5" /> Verified · ★ {data.rating.toFixed(1)}
          </div>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/95 text-earth">
          <QrCode className="h-10 w-10" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-[9px]">
        <Kv k="Artisan ID" v={data.artisanId} />
        <Kv k="Gov ID" v={data.govId} />
        <Kv k="Passport" v={data.passport} />
        <Kv k="Twin" v={data.twinStatus} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[9px] opacity-70">
        <div>Issued {data.issued}</div>
        <div>Expires {data.expiry}</div>
      </div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-2 py-1">
      <div className="uppercase tracking-widest opacity-60">{k}</div>
      <div className="truncate font-semibold">{v}</div>
    </div>
  );
}
