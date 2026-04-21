import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSceneProps = {
  children: ReactNode;
  className?: string;
  variant: "campaign" | "home";
};

const sceneStyles = {
  campaign: {
    auraA:
      "-top-10 right-[8%] h-56 w-56 bg-[radial-gradient(circle,_rgba(124,58,237,0.14),_transparent_70%)] sm:h-80 sm:w-80",
    auraB:
      "top-[26rem] left-[-5rem] h-60 w-60 bg-[radial-gradient(circle,_rgba(0,113,227,0.12),_transparent_70%)] sm:h-[24rem] sm:w-[24rem]",
    auraC:
      "bottom-[18%] right-[-4rem] h-52 w-52 bg-[radial-gradient(circle,_rgba(16,185,129,0.08),_transparent_70%)] sm:h-72 sm:w-72",
  },
  home: {
    auraA:
      "-top-12 left-[8%] h-56 w-56 bg-[radial-gradient(circle,_rgba(0,113,227,0.16),_transparent_70%)] sm:h-80 sm:w-80",
    auraB:
      "top-[24rem] right-[-6rem] h-64 w-64 bg-[radial-gradient(circle,_rgba(255,255,255,0.95),_transparent_72%)] sm:h-[28rem] sm:w-[28rem]",
    auraC:
      "bottom-[10%] left-[12%] h-52 w-52 bg-[radial-gradient(circle,_rgba(17,17,19,0.06),_transparent_70%)] sm:h-72 sm:w-72",
  },
} as const;

export function PageScene({ children, className, variant }: PageSceneProps) {
  const scene = sceneStyles[variant];

  return (
    <div className={cn("relative isolate", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[48px]">
        <div className={cn("absolute rounded-full blur-3xl", scene.auraA)} />
        <div className={cn("absolute rounded-full blur-3xl", scene.auraB)} />
        <div className={cn("absolute rounded-full blur-3xl", scene.auraC)} />
        <div className="absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="absolute inset-x-[12%] top-20 h-48 rounded-[40px] border border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)] opacity-60 blur-2xl" />
      </div>
      {children}
    </div>
  );
}
