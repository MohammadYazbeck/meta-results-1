"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  saveCampaignFinancialSettingsAction,
  saveGeneralFinancialSettingsAction,
} from "@/app/actions/financial-settings";
import {
  inputClassName,
  panelClassName,
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
  const selectedOverride = settings.campaigns[selectedCampaignId];

  return (
    <section className={cn(panelClassName, "mb-6 p-4 sm:p-6")}>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-[12px] font-bold text-[#a6530a]">
            إعدادات المدير فقط
          </p>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            سعر الصرف وإضافة الرصيد السالب
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            تطبق هذه القيم على الصفحة الرئيسية للمدير فقط. إعداد الحملة
            الفردي يتقدم على الإعداد العام، والحقل الفارغ يستخدم القيمة
            العامة تلقائياً.
          </p>
        </div>
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
              description="يستبدل ACCOUNT_TO_DISPLAY_RATE في حسابات لوحة المدير."
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
    </section>
  );
}
