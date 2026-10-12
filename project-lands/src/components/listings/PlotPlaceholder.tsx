import Contours from "@/components/ui/Contours";

// Photo placeholder: a contour pattern unique to each listing (seeded by slug).
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function PlotPlaceholder({ seed, className = "" }: { seed: string; className?: string }) {
  const h = hash(seed);
  const cx = 80 + (h % 240);
  const cy = 60 + ((h >>> 8) % 180);
  const phase = ((h >>> 16) % 628) / 100;

  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-brand-100 via-brand-50 to-lime-50 ${className}`}>
      <Contours
        width={400}
        height={300}
        clusters={[{ cx, cy, rings: 8, step: 22, phase }]}
        className="absolute inset-0 h-full w-full text-brand-700/20"
      />
    </div>
  );
}
