export default function SectionHeading({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-sm font-semibold uppercase tracking-[0.14em] ${
          light ? "text-brand-300" : "text-brand-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? "text-white" : "text-stone-900"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
