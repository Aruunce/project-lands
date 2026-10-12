// Decorative terrain contour lines (inline SVG). Rings are scaled copies, so they never cross.

export type ContourCluster = {
  cx: number;
  cy: number;
  rings: number;
  step: number;
  phase: number;
};

function ringPath(cx: number, cy: number, radius: number, phase: number): string {
  const points = 72;
  let d = "";

  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    const wobble =
      1 +
      0.12 * Math.sin(3 * t + phase) +
      0.06 * Math.sin(5 * t - phase * 1.7) +
      0.04 * Math.cos(2 * t + phase * 0.5);
    const x = cx + radius * wobble * Math.cos(t);
    const y = cy + radius * 0.8 * wobble * Math.sin(t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  return `${d}Z`;
}

export default function Contours({
  width,
  height,
  clusters,
  className = "",
}: {
  width: number;
  height: number;
  clusters: ContourCluster[];
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      className={className}
    >
      {clusters.flatMap((cluster, clusterIndex) =>
        Array.from({ length: cluster.rings }, (_, ring) => (
          <path
            key={`${clusterIndex}-${ring}`}
            d={ringPath(cluster.cx, cluster.cy, cluster.step * (ring + 1), cluster.phase + ring * 0.08)}
            strokeWidth={ring % 4 === 3 ? 1.6 : 1}
            vectorEffect="non-scaling-stroke"
          />
        )),
      )}
    </svg>
  );
}
