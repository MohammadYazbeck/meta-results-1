import { DailySpend } from "@/lib/meta";
import {
  formatDisplayCurrency,
  formatDisplayCurrencyCompact,
} from "@/lib/currency";

import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type SpendChartProps = {
  daily: DailySpend[];
};

export function SpendChart({ daily }: SpendChartProps) {
  const width = 760;
  const height = 280;
  const padding = 24;
  const totalSpend = daily.reduce((sum, entry) => sum + entry.spend, 0);
  const maxSpend = Math.max(...daily.map((entry) => entry.spend), 1);
  const stepX =
    daily.length > 1 ? (width - padding * 2) / (daily.length - 1) : 0;
  const labelStep = Math.max(1, Math.ceil(daily.length / 7));

  const points = daily
    .map((entry, index) => {
      const x = padding + stepX * index;
      const y =
        height - padding - (entry.spend / maxSpend) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = [
    `${padding},${height - padding}`,
    points,
    `${width - padding},${height - padding}`,
  ].join(" ");

  const ticks = [0.25, 0.5, 0.75, 1];

  return (
    <section className={cn(panelClassName, "min-w-0")}> 
      <SectionHeading
        action={
          <div className="rounded-full border border-black/[0.05] bg-white/75 px-3 py-1.5 text-[13px] text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            الإجمالي خلال الفترة {formatDisplayCurrency(totalSpend)}
          </div>
        }
        eyebrow="اتجاه الإنفاق"
        title="الإنفاق اليومي"
      />

      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
        <div className="overflow-hidden rounded-[28px] border border-black/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,249,251,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-4">
          <svg
            aria-label="Daily spend chart"
            className="h-auto w-full"
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <linearGradient id="spend-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 113, 227, 0.24)" />
                <stop offset="100%" stopColor="rgba(0, 113, 227, 0.01)" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => {
              const y = height - padding - tick * (height - padding * 2);

              return (
                <g key={tick}>
                  <line
                    stroke="rgba(17, 17, 19, 0.08)"
                    strokeDasharray="4 8"
                    strokeWidth="1"
                    x1={padding}
                    x2={width - padding}
                    y1={y}
                    y2={y}
                  />
                  <text
                    fill="rgba(110, 110, 115, 1)"
                    fontSize="12"
                    x={padding}
                    y={y - 8}
                  >
                    {formatDisplayCurrencyCompact(maxSpend * tick)}
                  </text>
                </g>
              );
            })}

            <polygon fill="url(#spend-area)" points={areaPoints} />
            <polyline
              fill="none"
              points={points}
              stroke="rgba(0, 113, 227, 1)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />

            {daily.map((entry, index) => {
              const x = padding + stepX * index;
              const y =
                height - padding -
                (entry.spend / maxSpend) * (height - padding * 2);

              return (
                <g key={`${entry.date}-${entry.spend}`}>
                  <circle cx={x} cy={y} fill="white" r="7" />
                  <circle
                    cx={x}
                    cy={y}
                    fill="rgba(0, 113, 227, 1)"
                    r="3.5"
                  />
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid gap-3 min-[500px]:grid-cols-2 xl:grid-cols-4">
            {daily
              .filter(
                (_, index) => index % labelStep === 0 || index === daily.length - 1,
              )
              .map((entry) => (
                <div
                  className="rounded-[22px] border border-black/[0.05] bg-white/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                  key={entry.date}
                >
                  <span className="block text-[11px] font-semibold uppercase text-muted">
                    {entry.date.slice(5)}
                  </span>
                  <strong className="mt-1 block font-display text-[15px] font-medium  text-ink">
                    {formatDisplayCurrencyCompact(entry.spend)}
                  </strong>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
