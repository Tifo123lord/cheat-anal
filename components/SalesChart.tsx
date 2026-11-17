export interface Point {
  label: string;
  sales: number;
  earnings: number;
}

/** Bar (sales) + line (earnings) chart in plain SVG, with a data table for screen readers. */
export default function SalesChart({ data }: { data: Point[] }) {
  const W = 600;
  const H = 220;
  const pad = { l: 36, r: 40, t: 14, b: 26 };
  const maxS = Math.max(1, ...data.map((d) => d.sales));
  const maxE = Math.max(1, ...data.map((d) => d.earnings));
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const bw = iw / data.length;
  const y = (v: number, m: number) => pad.t + ih - (v / m) * ih;
  const line = data
    .map((d, i) => `${(pad.l + bw * i + bw / 2).toFixed(1)},${y(d.earnings, maxE).toFixed(1)}`)
    .join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby="chart-t chart-d">
        <title id="chart-t">Monthly sales and earnings</title>
        <desc id="chart-d">Bars show units sold per month; the line shows net earnings in dollars.</desc>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={pad.t + ih * (1 - t)}
              y2={pad.t + ih * (1 - t)}
              stroke="#b9b098"
              strokeDasharray="3 3"
            />
            <text x={pad.l - 6} y={pad.t + ih * (1 - t) + 3} fontSize="9" textAnchor="end" fill="#57533f">
              {Math.round(maxS * t)}
            </text>
            <text x={W - pad.r + 6} y={pad.t + ih * (1 - t) + 3} fontSize="9" fill="#57533f">
              ${Math.round(maxE * t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.label}>
            <rect
              x={pad.l + bw * i + bw * 0.18}
              y={y(d.sales, maxS)}
              width={bw * 0.64}
              height={pad.t + ih - y(d.sales, maxS)}
              rx="2"
              fill="#e0102a"
              stroke="#a30b1e"
            />
            <text x={pad.l + bw * i + bw / 2} y={H - 9} fontSize="9" textAnchor="middle" fill="#57533f">
              {d.label}
            </text>
          </g>
        ))}
        <polyline points={line} fill="none" stroke="#c2452d" strokeWidth="2.2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={d.label} cx={pad.l + bw * i + bw / 2} cy={y(d.earnings, maxE)} r="3" fill="#c2452d" />
        ))}
      </svg>
      <figcaption className="mt-1 flex gap-4 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-leaf" /> Units sold
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-sale" /> Net earnings
        </span>
      </figcaption>
    </figure>
  );
}
