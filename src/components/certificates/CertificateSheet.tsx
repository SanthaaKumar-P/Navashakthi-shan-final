import { ShieldCheck, Award } from "lucide-react";
import logo from "@/assets/logo.png";

export function CertificateSheet({
  title, subtitle, holder, id, date, seal = "Craftmark",
}: { title: string; subtitle: string; holder: string; id: string; date: string; seal?: string }) {
  return (
    <div className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-2xl border-[6px] border-double border-gold/60 bg-cream p-8 shadow-elegant">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #0B5D50 0 1px, transparent 1px 12px)" }} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-10 w-10" />
            <div>
              <div className="font-display text-lg text-primary">NAVSHAKTHI</div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Ministry of MSME · Verified</div>
            </div>
          </div>
          <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
            <div>Certificate No.</div>
            <div className="mt-0.5 font-semibold text-earth">{id}</div>
          </div>
        </div>

        <div className="my-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-clay">{seal}</div>
          <div className="mt-2 font-display text-4xl text-earth">{title}</div>
          <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>

          <div className="mx-auto mt-6 h-px w-24 bg-gold" />
          <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Presented to</div>
          <div className="mt-1 font-display text-3xl text-primary">{holder}</div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Issued on</div>
            <div className="font-semibold text-earth">{date}</div>
          </div>
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-clay bg-clay/10 text-clay">
              <Award className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-clay px-2 py-0.5 text-[8px] font-bold text-white">SEAL</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Authorised</div>
            <div className="font-display italic text-earth">Team NAVSHAKTHI</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-primary"><ShieldCheck className="h-3 w-3" /> Government verified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
