import { Mail, Phone } from "lucide-react";
import Contours from "@/components/ui/Contours";
import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import SectionHeading from "./SectionHeading";

export default function Contact() {
  const { name, phone, email } = siteConfig.contact;
  const hasContacts = Boolean(phone || email);

  return (
    <section id="kontaktai" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-white sm:px-12 sm:py-16">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,var(--color-brand-700),transparent_70%)]" />
            <Contours
              width={1200}
              height={500}
              clusters={[{ cx: 1050, cy: 420, rings: 9, step: 40, phase: 1.2 }]}
              className="absolute inset-0 -z-10 h-full w-full text-white/[0.07]"
            />

            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <SectionHeading eyebrow="Kontaktai" title="Domina pasiūlymas?" light />
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">
                  Parašykite arba paskambinkite — atsakysime į klausimus ir suderinsime apžiūrą.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="group flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-brand-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white transition-transform duration-300 group-hover:scale-110">
                      <Phone className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-stone-500">Telefonas</span>
                      <span className="font-semibold">{phone}</span>
                    </span>
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="group flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:scale-110">
                      <Mail className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-white/60">El. paštas</span>
                      <span className="font-semibold">{email}</span>
                    </span>
                  </a>
                )}
                {name && hasContacts && <p className="px-1 text-sm text-white/60">{name}</p>}
                {!hasContacts && (
                  <p className="rounded-2xl bg-white/10 px-5 py-5 text-white/80 ring-1 ring-white/15">
                    Kontaktinė informacija bus paskelbta netrukus.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
