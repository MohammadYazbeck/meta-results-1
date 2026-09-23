import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSceneProps = {
  children: ReactNode;
  className?: string;
  variant: "campaign" | "home";
};

export function PageScene({ children, className, variant }: PageSceneProps) {
  return (
    <div className={cn("relative", className)} data-page-variant={variant}>
      {children}
    </div>
  );
}
