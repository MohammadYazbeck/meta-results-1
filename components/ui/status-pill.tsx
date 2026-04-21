import { cn } from "@/lib/utils";

type StatusPillProps = {
  className?: string;
  source: "live" | "mock";
};

export function StatusPill({ className, source }: StatusPillProps) {
  const isLive = source === "live";

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
          isLive ? "bg-success shadow-[0_0_0_4px_rgba(29,156,88,0.12)]" : "bg-accent shadow-[0_0_0_4px_rgba(0,113,227,0.1)]",
        )}
      />
      {isLive ? "بيانات ميتا المباشرة" : "بيانات تجريبية"}
    </span>
  );
}
