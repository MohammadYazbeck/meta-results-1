"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  saveCampaignFinancialSettingsAction,
  saveGeneralFinancialSettingsAction,
} from "@/app/actions/financial-settings";
import {
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/ui/class-names";
import type { FinancialSettingsSnapshot } from "@/lib/financial-settings-store";
import type { CampaignSpend } from "@/lib/meta";
import { cn } from "@/lib/utils";

type FinancialSettingsPanelProps = {
  campaigns: Pick<CampaignSpend, "campaignId" | "campaignName">[];
  settings: FinancialSettingsSnapshot;
};

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(primaryButtonClassName, "w-full sm:w-auto")}
      disabled={pending}
      type="submit"
    >
      {pending ? "جاري الحفظ..." : children}
    </button>
  );
}

function SettingField({
  defaultValue,
  description,
  label,
  min = "0",
  name,
  placeholder,
  required,
}: {
  defaultValue?: number;
  description: string;
  label: string;
  min?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input
        className={inputClassName}
        defaultValue={defaultValue}
        inputMode="decimal"
        min={min}
        name={name}
        placeholder={placeholder}
        required={required}
        step="0.000001"
        type="number"
      />
      <span className="text-[12px] leading-5 text-muted">{description}</span>
    </label>
  );
}

export function FinancialSettingsPanel({
  campaigns,
  settings,
}: FinancialSettingsPanelProps) {
  const campaignOptions = useMemo(() => {
    const campaignMap = new Map(
      campaigns.map((campaign) => [campaign.campaignId, campaign]),
    );

    for (const campaignId of Object.keys(settings.campaigns)) {
      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          campaignId,
          campaignName: `Campaign ${campaignId}`,
        });
      }
    }

    return [...campaignMap.values()].sort((left, right) =>
      left.campaignName.localeCompare(right.campaignName),
    );
  }, [campaigns, settings.campaigns]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    campaignOptions[0]?.campaignId ?? "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const selectedOverride = settings.campaigns[selectedCampaignId];

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="group mb-6 flex w-full items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3.5 text-right shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.04] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)] sm:px-5"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1df] text-[#c56812]">
            <svg aria-hidden="true" fill="none" height="21" viewBox="0 0 24 24" width="21">
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="min-w-0">
            <strong className="block text-sm font-bold text-ink sm:text-[15px]">
              إعدادات الحسابات
            </strong>
            <span className="mt-0.5 block truncate text-xs text-muted">
              سعر الصرف العام {settings.resolvedGeneral.exchangeRate} · الإعدادات الفردية {Object.keys(settings.campaigns).length}
            </span>
          </span>
        </span>
        <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-[#f0f2f5] px-3 text-xs font-bold text-ink transition group-hover:bg-[#fff1df]">
          تعديل
          <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 24 24" width="15">
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
          onMouseDown={() => setIsOpen(false)}
        >
          <section
            aria-labelledby="financial-settings-title"
            aria-modal="true"
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[26px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:max-h-[90vh] sm:rounded-[26px]"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="mb-1 text-[11px] font-bold text-[#a6530a]">إعدادات المدير فقط</p>
                <h2 className="font-display text-xl font-bold text-ink sm:text-2xl" id="financial-settings-title">
                  سعر الصرف والحسابات المالية
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm">
                  الإعداد الفردي يتقدم على الإعداد العام، والحقل الفارغ يستخدم القيمة العامة.
                </p>
              </div>
              <button
                aria-label="إغلاق"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f2f5] text-xl text-muted transition hover:bg-[#e7eaf0] hover:text-ink"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </header>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 flex justify-end">
                <span className="inline-flex w-fit rounded-full bg-[#f0f2f5] px-3 py-1.5 text-xs font-semibold text-muted">
                  قيمة البيئة الأصلية: {settings.baseExchangeRate}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
        <form
          action={saveGeneralFinancialSettingsAction}
          className="grid content-start gap-4 rounded-[18px] bg-[#f7f9fc] p-4 ring-1 ring-black/[0.035] sm:p-5"
        >
          <div>
            <h3 className="text-base font-bold text-ink">الإعداد العام</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              يستخدم لجميع الحملات التي لا تملك إعداداً فردياً.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingField
              defaultValue={settings.resolvedGeneral.exchangeRate}
              description="يستبدل ACCOUNT_TO_DISPLAY_RATE في حسابات المصروف والرصيد."
              label="سعر الصرف العام"
              min="0.000001"
              name="exchangeRate"
              required
            />
            <SettingField
              defaultValue={settings.resolvedGeneral.negativeBalanceAddOnPercent}
              description="نسبة تضاف فقط عندما يكون رصيد الحملة سالباً."
              label="الإضافة العامة %"
              name="negativeBalanceAddOnPercent"
              required
            />
          </div>

          <div>
            <SubmitButton>حفظ الإعداد العام</SubmitButton>
          </div>
        </form>

        <div className="grid content-start gap-4 rounded-[18px] bg-[#fff8ef] p-4 ring-1 ring-[#f28c28]/15 sm:p-5">
          <div>
            <h3 className="text-base font-bold text-ink">إعداد حملة فردي</h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              اختر العميل حسب اسم الحملة. اترك أي حقل فارغاً لاستخدام
              الإعداد العام.
            </p>
          </div>

          {campaignOptions.length ? (
            <>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-ink">العميل / الحملة</span>
                <select
                  className={cn(inputClassName, "w-full")}
                  onChange={(event) => setSelectedCampaignId(event.target.value)}
                  value={selectedCampaignId}
                >
                  {campaignOptions.map((campaign) => (
                    <option key={campaign.campaignId} value={campaign.campaignId}>
                      {campaign.campaignName} — {campaign.campaignId}
                    </option>
                  ))}
                </select>
              </label>

              <form
                action={saveCampaignFinancialSettingsAction}
                className="grid gap-4"
                key={selectedCampaignId}
              >
                <input name="campaignId" type="hidden" value={selectedCampaignId} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SettingField
                    defaultValue={selectedOverride?.exchangeRate}
                    description={`فارغ = السعر العام (${settings.resolvedGeneral.exchangeRate}).`}
                    label="سعر الصرف الفردي"
                    min="0.000001"
                    name="exchangeRate"
                    placeholder={String(settings.resolvedGeneral.exchangeRate)}
                  />
                  <SettingField
                    defaultValue={selectedOverride?.negativeBalanceAddOnPercent}
                    description={`فارغ = الإضافة العامة (${settings.resolvedGeneral.negativeBalanceAddOnPercent}%).`}
                    label="الإضافة الفردية %"
                    name="negativeBalanceAddOnPercent"
                    placeholder={String(
                      settings.resolvedGeneral.negativeBalanceAddOnPercent,
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <SubmitButton>حفظ إعداد الحملة</SubmitButton>
                  {selectedOverride ? (
                    <span className={cn(secondaryButtonClassName, "cursor-default")}>
                      يوجد إعداد فردي محفوظ
                    </span>
                  ) : (
                    <span className="inline-flex min-h-10 items-center text-xs font-semibold text-muted">
                      تستخدم هذه الحملة الإعداد العام حالياً
                    </span>
                  )}
                </div>
                <p className="text-xs leading-5 text-muted">
                  لحذف الإعداد الفردي والعودة للقيم العامة، امسح الحقلين ثم
                  احفظ.
                </p>
              </form>
            </>
          ) : (
            <p className="rounded-xl bg-white/70 px-4 py-4 text-sm leading-6 text-muted ring-1 ring-black/[0.035]">
              لا توجد حملات متاحة حالياً. يمكنك حفظ الإعداد العام، وستظهر
              الحملات الفردية هنا عند توفر بيانات ميتا.
            </p>
          )}
        </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
