import { ChevronDown } from "lucide-react";
import Contours from "@/components/ui/Contours";
import SearchForm from "@/components/listings/SearchForm";
import { pluralize } from "@/lib/format";

export default function Hero({ activeListings }: { activeListings: number }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      {/* Background: soft glow + slowly drifting terrain contours */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_70%_at_85%_10%,var(--color-brand-700),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_0%_100%,var(--color-brand-800),transparent_70%)]" />
      <Contours
        width={1440}
        height={800}
        clusters={[
          { cx: 1180, cy: 200, rings: 11, step: 44, phase: 0.4 },
          { cx: 180, cy: 700, rings: 8, step: 50, phase: 2.1 },
        ]}
        className="absolute -inset-[5%] -z-10 h-[110%] w-[110%] animate-drift text-white/[0.08]"
      />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-44">
        <p className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/85 ring-1 ring-white/15 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-300 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-300" />
          </span>
          {activeListings > 0
            ? `${activeListings} ${pluralize(activeListings, ["aktyvus skelbimas", "aktyvūs skelbimai", "aktyvių skelbimų"])}`
            : "Nauji skelbimai jau netrukus"}
        </p>

        <h1 className="mt-6 max-w-3xl animate-fade-up font-display text-4xl font-bold leading-[1.1] tracking-tight [animation-delay:120ms] sm:text-6xl">
          Žemės sklypai <span className="text-brand-300">ir kitas nekilnojamasis turtas</span>
        </h1>

        <p className="mt-5 max-w-xl animate-fade-up text-lg leading-relaxed text-white/75 [animation-delay:240ms]">
          Sklypai, sodybos ir kitas NT Lietuvoje — aiški kaina, plotas ir vieta žemėlapyje, tiesioginis
          kontaktas su pardavėju.
        </p>

        <div className="mt-10 animate-fade-up [animation-delay:360ms]">
          <SearchForm />
        </div>
      </div>

      <a
        href="#skelbimai"
        aria-label="Slinkti prie skelbimų"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 transition-colors hover:text-white sm:block"
      >
        <ChevronDown className="size-7 animate-float" />
      </a>
    </section>
  );
}
