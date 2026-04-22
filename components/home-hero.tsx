import { adminLogoutAction } from "@/app/actions/admin-auth";
import { StatusPill } from "@/components/ui/status-pill";
import {
  eyebrowClassName,
  panelClassName,
  secondaryButtonClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  accountId: string;
  rangeLabel: string;
  source: "live" | "mock";
};

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-[24px] border border-black/[0.06] bg-white/75 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <span className="text-[11px] font-semibold uppercase  text-muted">
        {label}
      </span>
      <strong className="break-all font-display text-[15px] font-medium  text-ink">
        {value}
      </strong>
    </div>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 text-xs font-medium text-[#3a3a3c] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      {label}
    </span>
  );
}

export function HomeHero({ accountId, rangeLabel, source }: HomeHeroProps) {
  return (
    <section
      className={cn(
        panelClassName,
        "relative mb-8 grid gap-8 px-5 py-6 sm:px-6 sm:py-7 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,113,227,0.11),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.9),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
      <div className="pointer-events-none absolute left-[8%] top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95),_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-[12%] right-[12%] h-px bg-gradient-to-l from-transparent via-white/80 to-transparent" />

      <div className="relative z-[1]">
        <p className={eyebrowClassName}>لوحة تقارير ميتا</p>
        <h1 className="max-w-[11ch] font-display text-[clamp(2.25rem,5vw,5rem)] leading-[0.92]  text-ink max-sm:max-w-none">
          صورة أوضح لأداء حملاتك.
        </h1>

        <p className="mt-5 max-w-[60ch] text-[1rem] leading-8 text-[#333336] sm:text-[1.06rem]">
          بيانات مباشرة من{" "}
          <span className="font-medium text-ink">Meta Marketing API</span> داخل
          واجهة عربية هادئة، مصممة لقراءة أسرع وفهم أسرع للنتائج.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <FeatureChip label="إحصاءات ميتا" />
          <FeatureChip label="أداء الحملات" />
          <FeatureChip label="تقارير مباشرة" />
        </div>
      </div>

      <div className="relative z-[1] grid content-start gap-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
          <StatusPill source={source} />
          <form action={adminLogoutAction}>
            <button className={secondaryButtonClassName} type="submit">
              تسجيل الخروج
            </button>
          </form>
        </div>

        <div className="grid gap-3">
          <MetaItem label="حساب الإعلانات" value={accountId} />
          <MetaItem label="الفترة" value={rangeLabel} />
          <MetaItem label="المسار البرمجي" value="/api/meta/insights" />
        </div>
      </div>
    </section>
  );
}
