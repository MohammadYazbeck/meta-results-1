import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type ErrorPanelProps = {
  message: string;
  title: string;
};

export function ErrorPanel({ message, title }: ErrorPanelProps) {
  return (
    <section className={cn(panelClassName, "mb-6")}> 
      <SectionHeading
        description={message}
        eyebrow="مشكلة في الاتصال بميتا"
        title={title}
      />
    </section>
  );
}
