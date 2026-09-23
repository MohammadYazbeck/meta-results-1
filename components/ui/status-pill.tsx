import { cn } from "@/lib/utils";
import type { DataSource } from "@/lib/meta";

type StatusPillProps = {
  className?: string;
  source: DataSource;
};

export function StatusPill({ className, source }: StatusPillProps) {
  const isLive = source === "live";
  const isUnavailable = source === "unavailable";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-[12px] font-semibold text-muted shadow-sm ring-1 ring-black/[0.035]",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isLive
            ? "bg-success"
            : isUnavailable
              ? "bg-danger"
              : "bg-accent",
        )}
      />
      {isLive
        ? "بيانات ميتا المباشرة"
        : isUnavailable
          ? "بيانات ميتا غير متاحة"
          : "بيانات تجريبية"}
    </span>
  );
}
