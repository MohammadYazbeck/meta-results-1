import { saveCampaignBudgetAction } from "@/app/actions/campaign-budget";
import {
  inputClassName,
  mutedTextClassName,
  panelClassName,
  primaryButtonClassName,
} from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { CampaignBudgetRecord } from "@/lib/budget-store";
import { formatDisplayCurrency } from "@/lib/currency";
import { DateRange } from "@/lib/meta";
import { cn } from "@/lib/utils";

type CampaignBudgetPanelProps = {
  campaignId: string;
  payments: CampaignBudgetRecord["payments"];
  range: DateRange;
};

export function CampaignBudgetPanel({
  campaignId,
  payments,
  range,
}: CampaignBudgetPanelProps) {
  return (
    <section className={cn(panelClassName, "w-full max-w-lg")}> 
      <SectionHeading
        description="إدارة الدفعات المسجلة للحملة من واجهة المدير."
        eyebrow="إدخال الدفعات"
        title="إضافة دفعة"
      />

      <div className="grid gap-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form action={saveCampaignBudgetAction} className="grid gap-3">
          <input name="campaignId" type="hidden" value={campaignId} />
          <input name="start" type="hidden" value={range.start} />
          <input name="end" type="hidden" value={range.end} />

          <label className="text-sm font-medium text-muted" htmlFor="paymentAmount">
            أضف دفعة جديدة لهذه الحملة
          </label>

          <input
            className={inputClassName}
            id="paymentAmount"
            inputMode="decimal"
            min="0"
            name="paymentAmount"
            placeholder="0.00"
            step="0.01"
            type="number"
          />

          <button className={primaryButtonClassName} type="submit">
            إضافة دفعة
          </button>

          <p className={mutedTextClassName}>
            كل دفعة يتم حفظها بشكل مستقل، وإجمالي المدفوع هو مجموع كل الدفعات
            المرتبطة بالحملة.
          </p>
        </form>

        <div className="rounded-[28px] border border-black/[0.05] bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              آخر الدفعات
            </span>
            <span className="text-xs font-medium text-muted">
              {payments.length} سجل
            </span>
          </div>

          <div className="grid gap-3">
            {payments.slice(0, 6).map((payment) => (
              <div
                className="rounded-[22px] border border-black/[0.05] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                key={payment.id}
              >
                <strong className="font-display text-[15px] font-medium tracking-[-0.03em] text-ink">
                  {formatDisplayCurrency(payment.amount)}
                </strong>
                <span className="mt-1 block text-xs leading-6 text-muted">
                  {new Date(payment.createdAt).toLocaleString()}
                </span>
              </div>
            ))}

            {!payments.length ? (
              <p className="text-sm leading-7 text-muted">
                لا توجد دفعات مسجلة لهذه الحملة حتى الآن.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
