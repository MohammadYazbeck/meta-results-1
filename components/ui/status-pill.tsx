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
        "inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.05] bg-white/80 px-4 py-2 text-[13px] font-medium text-[#3a3a3c] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isLive
            ? "bg-success shadow-[0_0_0_4px_rgba(29,156,88,0.12)]"
            : isUnavailable
              ? "bg-[#b42318] shadow-[0_0_0_4px_rgba(180,35,24,0.12)]"
              : "bg-accent shadow-[0_0_0_4px_rgba(0,113,227,0.1)]",
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
