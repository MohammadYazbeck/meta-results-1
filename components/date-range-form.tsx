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
        "grid gap-3 md:grid-cols-[repeat(2,minmax(0,1fr))_auto] md:items-end",
        compact && "gap-2.5 sm:gap-3",
      )}
      method="get"
    >
      <div className={formFieldClassName}>
        <label
          className={cn(
            "text-sm font-bold text-muted",
            compact && "text-[13px] sm:text-sm",
          )}
          htmlFor="start"
        >
          تاريخ البداية
        </label>
        <input
          className={cn(
            inputClassName,
            compact &&
              "min-h-[46px] rounded-[16px] px-3.5 text-sm sm:min-h-[54px] sm:rounded-[20px] sm:px-4 sm:text-base",
          )}
          defaultValue={range.start}
          id="start"
          name="start"
          type="date"
        />
      </div>

      <div className={formFieldClassName}>
        <label
          className={cn(
            "text-sm font-bold text-muted",
            compact && "text-[13px] sm:text-sm",
          )}
          htmlFor="end"
        >
          تاريخ النهاية
        </label>
        <input
          className={cn(
            inputClassName,
            compact &&
              "min-h-[46px] rounded-[16px] px-3.5 text-sm sm:min-h-[54px] sm:rounded-[20px] sm:px-4 sm:text-base",
          )}
          defaultValue={range.end}
          id="end"
          name="end"
          type="date"
        />
      </div>

      <button
        className={cn(
          primaryButtonClassName,
          "md:min-h-[54px] md:px-6",
          compact &&
            "min-h-[46px] px-4 py-2.5 text-[13px] sm:min-h-12 sm:px-5 sm:py-3 sm:text-sm",
        )}
        type="submit"
      >
        تطبيق الفترة
      </button>
    </form>
  );
}
