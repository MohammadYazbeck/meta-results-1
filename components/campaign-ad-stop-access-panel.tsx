import { saveAdStopAccessAction } from "@/app/actions/ad-stop-access";
import {
  inputClassName,
  panelClassName,
  primaryButtonClassName,
} from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { type CampaignAdStopAccessRecord } from "@/lib/ad-stop-access-store";
import { cn } from "@/lib/utils";

type CampaignAdStopAccessPanelProps = {
  access: CampaignAdStopAccessRecord;
  campaignId: string;
};

function formatAuditDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function AccessStatusPill({ access }: { access: CampaignAdStopAccessRecord }) {
  const isReady = access.enabled && access.hasPasscode;

  return (
    <span
      className={cn(
        "inline-flex min-h-[30px] w-fit items-center rounded-full border px-3 text-[12px] font-semibold",
        isReady
          ? "border-[#10b981]/15 bg-[#ecfdf5] text-[#047857]"
          : "border-[#8e8e93]/16 bg-white/72 text-[#6e6e73]",
      )}
    >
      {isReady ? "مفعّل للعميل" : "غير مفعّل"}
    </span>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-black/[0.05] bg-white/72 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <span className="block text-[11px] font-semibold uppercase text-muted">
        {label}
      </span>
      <strong className="mt-1 block text-sm font-medium text-ink">
        {value}
      </strong>
    </div>
  );
}

export function CampaignAdStopAccessPanel({
  access,
  campaignId,
}: CampaignAdStopAccessPanelProps) {
  return (
    <section className={cn(panelClassName, "w-full")}>
      <SectionHeading
        action={<AccessStatusPill access={access} />}
        description="اسمح للعميل بإيقاف الإعلانات النشطة في هذه الحملة بعد إدخال رمز خاص."
        eyebrow="صلاحية العميل"
        title="تحكم إيقاف الإعلان"
      />

      <div className="grid gap-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingRow
            label="ظهور الزر"
            value={access.enabled ? "يظهر للعميل" : "مخفي عن العميل"}
          />
          <SettingRow
            label="رمز الإيقاف"
            value={access.hasPasscode ? "تم تعيينه" : "غير معيّن"}
          />
        </div>

        <form
          action={saveAdStopAccessAction}
          className="grid gap-4 rounded-[26px] border border-black/[0.05] bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]"
        >
          <input name="campaignId" type="hidden" value={campaignId} />

          <label className="flex items-center justify-between gap-4 rounded-[22px] border border-black/[0.05] bg-[var(--bg-soft)] px-4 py-3 text-sm font-medium text-ink">
            <span className="grid gap-1">
              <span>تفعيل زر الإيقاف للعميل</span>
              <span className="text-xs font-normal leading-6 text-muted">
                عند التفعيل، يظهر الزر فقط على الإعلانات النشطة.
              </span>
            </span>
            <span className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-[#e5e7eb] p-1">
              <input
                className="peer sr-only"
                defaultChecked={access.enabled}
                name="enabled"
                type="checkbox"
              />
              <span className="h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5 peer-checked:bg-[#10b981]" />
            </span>
          </label>

          <div className="grid gap-2">
            <label
              className="text-sm font-medium text-muted"
              htmlFor="adStopPasscode"
            >
              رمز العميل
            </label>
            <input
              autoComplete="off"
              className={inputClassName}
              id="adStopPasscode"
              maxLength={64}
              minLength={4}
              name="passcode"
              placeholder={
                access.hasPasscode
                  ? "اتركه فارغاً للإبقاء على الرمز الحالي"
                  : "أدخل رمزاً من 4 أحرف أو أكثر"
              }
              type="text"
            />
            <p className="text-xs leading-6 text-muted">
              لا يتم عرض الرمز للعميل داخل التقرير. عند تغييره، يصبح الرمز القديم غير صالح فوراً.
            </p>
          </div>

          <button className={primaryButtonClassName} type="submit">
            حفظ إعدادات الإيقاف
          </button>
        </form>

        <div className="rounded-[26px] border border-black/[0.05] bg-white/62 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase text-muted">
              آخر عمليات الإيقاف
            </span>
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-muted">
              {access.audit.length}
            </span>
          </div>

          <div className="grid gap-2">
            {access.audit.slice(0, 5).map((entry) => (
              <div
                className="grid gap-1 rounded-[18px] border border-black/[0.05] bg-white/82 px-3.5 py-3"
                key={entry.id}
              >
                <strong className="break-words text-sm font-medium text-ink">
                  {entry.adName || `Ad ${entry.adId}`}
                </strong>
                <span className="text-xs leading-6 text-muted">
                  تم الإيقاف {formatAuditDate(entry.createdAt)}
                </span>
              </div>
            ))}

            {!access.audit.length ? (
              <p className="rounded-[18px] border border-dashed border-black/[0.08] bg-white/45 px-4 py-5 text-center text-sm leading-7 text-muted">
                لا توجد عمليات إيقاف مسجلة لهذه الحملة حتى الآن.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
