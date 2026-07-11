import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Get in touch" title="Let's build the future of handmade India." />
      <section className="container-x py-20 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "hello@navshakthi.in" },
            { icon: Phone, label: "Phone", value: "+91 44 4000 7000" },
            { icon: MapPin, label: "Head office", value: "IIT-Madras Research Park, Chennai — 600113" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                <div className="font-display text-lg">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
        <form className="rounded-3xl border border-border/60 bg-card p-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Name</span>
              <input className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3" />
            </label>
            <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
              <input type="email" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3" />
            </label>
          </div>
          <label className="block"><span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message</span>
            <textarea rows={6} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3" />
          </label>
          <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Send message</button>
        </form>
      </section>
    </PublicPage>
  ),
});
