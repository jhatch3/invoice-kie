const STATS = [
  { value: "0.91", label: "Field F1 (CORD)" },
  { value: "0.86", label: "Line-item F1" },
  { value: "120 ms", label: "Median latency / doc" },
  { value: "$0.40", label: "Est. cost / 1k docs" },
] as const;

export function HeroStats() {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <dd className="font-mono text-3xl tracking-tight tabular-nums">{stat.value}</dd>
          <dt className="mt-1 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
