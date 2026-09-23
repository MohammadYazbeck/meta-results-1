import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const nextSteps = [
  "إضافة المزيد من المقاييس مثل النقرات وCTR وCPC لتحليل الأداء بشكل أدق.",
  "إضافة فلاتر حالة الحملة والهدف الإعلاني بعد تثبيت مسار التقارير.",
  "تخزين البيانات اليومية في قاعدة بيانات لتقليل الضغط على API.",
  "تفعيل أوامر الكتابة فقط بعد استقرار لوحة التقارير واعتماد الصلاحيات.",
];

export function NextStepsPanel() {
  return (
    <section className={cn(panelClassName, "h-fit")}> 
      <SectionHeading
        description="خارطة طريق قصيرة للنسخة القادمة من المنتج."
        eyebrow="الخطوة التالية"
        title="تطويرات مقترحة"
      />

      <ol className="grid gap-2 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {nextSteps.map((step, index) => (
          <li
            className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-lg border border-line bg-[var(--bg-soft)] px-4 py-4"
            key={step}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3ff] text-xs font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm leading-7 text-[#2f2f33]">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
