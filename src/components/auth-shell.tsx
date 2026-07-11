import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png";
import heroImg from "@/assets/hero-artisan.jpg";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-earth/85 via-earth/60 to-forest/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-cream">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="NAVSHAKTHI" className="h-11 w-11 brightness-125" />
            <div>
              <div className="font-display text-xl">NAVSHAKTHI</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cream/60">Culture · Crafts · AI</div>
            </div>
          </Link>
          <div>
            <h2 className="font-display text-4xl leading-tight">
              A marketplace built for <em className="italic text-gold">70 lakh hands.</em>
            </h2>
            <p className="mt-4 max-w-md text-cream/70">Join India's most trusted AI-enabled marketplace for rural artisans, buyers and government partners.</p>
          </div>
          <div className="text-xs text-cream/50">© {new Date().getFullYear()} NAVSHAKTHI · Team TAARANG</div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <Link to="/" className="lg:hidden mb-8 flex items-center gap-3">
            <img src={logo} alt="NAVSHAKTHI" className="h-10 w-10" />
            <div className="font-display text-lg text-primary">NAVSHAKTHI</div>
          </Link>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}

export function AuthOutlet() {
  return <Outlet />;
}

export { useNavigate };
