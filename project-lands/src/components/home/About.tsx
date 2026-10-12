import { FileText, MessageCircle, Search } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import SectionHeading from "./SectionHeading";

const FEATURES = [
  {
    icon: FileText,
    title: "Aiški informacija",
    text: "Plotas, paskirtis, kaina ir vieta — viskas viename puslapyje.",
  },
  {
    icon: Search,
    title: "Patogi paieška",
    text: "Raskite sklypą ar kitą objektą pagal vietovę, savivaldybę ar pavadinimą.",
  },
  {
    icon: MessageCircle,
    title: "Tiesioginis kontaktas",
    text: "Klausimus užduokite tiesiogiai — paskambinkite ar parašykite.",
  },
];

export default function About() {
  return (
    <section id="apie" className="scroll-mt-16 border-y border-stone-200/70 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <SectionHeading eyebrow="Apie" title="Nekilnojamasis turtas — paprastai ir aiškiai" />
          <p className="mt-6 text-lg leading-relaxed text-stone-600">{siteConfig.about}</p>
        </Reveal>

        <div className="grid gap-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 120}>
              <div className="flex gap-5 rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-brand-950/5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                  <feature.icon className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-stone-900">{feature.title}</h3>
                  <p className="mt-1 text-stone-600">{feature.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
