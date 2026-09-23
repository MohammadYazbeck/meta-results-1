import { DateRange } from "@/lib/meta";

import {
  formFieldClassName,
  inputClassName,
  primaryButtonClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type DateRangeFormProps = {
  action?: string;
  compact?: boolean;
  range: DateRange;
};

export function DateRangeForm({
  action = "/",
  compact = false,
  range,
}: DateRangeFormProps) {
  return (
    <form
      action={action}
      className={cn(
        "grid gap-4 rounded-[20px] bg-surface p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] sm:p-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center",
        compact && "gap-3 p-3",
      )}
      method="get"
    >
      <div className="flex items-center gap-3 lg:min-h-11">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#ffecd5,#fff7ed)] text-[#c56812] shadow-[0_6px_16px_rgba(242,140,40,0.16)]">
          <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
            <path d="M7 3v3m10-3v3M4.5 9.5h15M6.5 5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </span>
        <div>
          <strong className="block text-sm font-semibold text-ink">الفترة الزمنية</strong>
          <span className="mt-0.5 block text-xs text-muted">خصص نطاق عرض النتائج</span>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl bg-[#f4f6f9] p-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
        <div className={formFieldClassName}>
          <label className="text-[12px] font-medium text-muted" htmlFor="start">
            من
          </label>
          <input
            className={cn(inputClassName, "w-full bg-white shadow-sm focus:border-[#d8781c]/20 focus:ring-[#f28c28]/10")}
            defaultValue={range.start}
            id="start"
            name="start"
            type="date"
          />
        </div>

        <span className="hidden h-9 w-9 self-center items-center justify-center rounded-full bg-white text-lg text-[#d8781c] shadow-sm sm:flex" aria-hidden="true">
          ←
        </span>

        <div className={formFieldClassName}>
          <label className="text-[12px] font-medium text-muted" htmlFor="end">
            إلى
          </label>
          <input
            className={cn(inputClassName, "w-full bg-white shadow-sm focus:border-[#d8781c]/20 focus:ring-[#f28c28]/10")}
            defaultValue={range.end}
            id="end"
            name="end"
            type="date"
          />
        </div>
      </div>

      <button
        className={cn(
          primaryButtonClassName,
          "w-full lg:w-auto lg:min-h-11 lg:px-5",
          compact &&
            "min-h-11 px-4 py-2 text-[13px] sm:text-sm",
        )}
        type="submit"
      >
        تطبيق الفترة
      </button>
    </form>
  );
}
