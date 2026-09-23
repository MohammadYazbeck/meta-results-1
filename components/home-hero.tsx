import { adminLogoutAction } from "@/app/actions/admin-auth";
import { StatusPill } from "@/components/ui/status-pill";
import type { DataSource } from "@/lib/meta";
import {
  eyebrowClassName,
  panelClassName,
  secondaryButtonClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  accountId: string;
  rangeLabel: string;
  source: DataSource;
};

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-2xl bg-white/75 px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ring-1 ring-black/[0.035]">
      <span className="text-[12px] text-muted">{label}</span>
      <strong className="break-all font-display text-[14px] font-semibold text-ink">
        {value}
      </strong>
    </div>
  );
}

function FeatureChip({ accent = false, label }: { accent?: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold",
        accent
          ? "bg-[#fff1df] text-[#a6530a]"
          : "bg-white/75 text-muted ring-1 ring-black/[0.04]",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          accent ? "bg-[#f28c28]" : "bg-[#0866ff]/55",
        )}
      />
      {label}
    </span>
  );
}

export function HomeHero({ accountId, rangeLabel, source }: HomeHeroProps) {
  return (
    <section
      className={cn(
        panelClassName,
        "relative mb-6 bg-[radial-gradient(circle_at_6%_12%,rgba(242,140,40,0.16),transparent_22rem),radial-gradient(circle_at_88%_92%,rgba(8,102,255,0.12),transparent_24rem),#ffffff] p-5 sm:p-7"
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-[-2.5rem] top-[-2.5rem] h-32 w-32 rounded-full bg-[#f28c28]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-4rem] right-[12%] h-44 w-44 rounded-full bg-[#0866ff]/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className={cn(eyebrowClassName, "rounded-full bg-[#fff1df] px-3 py-1.5")}>لوحة تقارير ميتا</p>
          <h1 className="mt-2 max-w-[18ch] font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] text-ink">
            صورة أوضح لأداء حملاتك.
          </h1>

          <p className="mt-2 max-w-[60ch] text-[15px] leading-7 text-muted">
            بيانات مباشرة من{" "}
            <span className="font-medium text-ink">Meta Marketing API</span> داخل
            واجهة عربية هادئة، مصممة لقراءة أسرع وفهم أسرع للنتائج.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <FeatureChip label="إحصاءات ميتا" />
            <FeatureChip label="أداء الحملات" />
            <FeatureChip accent label="تقارير مباشرة" />
          </div>
        </div>

        <div className="grid min-w-0 gap-4 xl:min-w-[360px]">
          <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
            <StatusPill source={source} />
            <form action={adminLogoutAction}>
              <button className={secondaryButtonClassName} type="submit">
                تسجيل الخروج
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <MetaItem label="حساب الإعلانات" value={accountId} />
            <MetaItem label="الفترة" value={rangeLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
