const DEFAULT_AED_TO_USD = 0.272294;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getAccountCurrency() {
  return process.env.ACCOUNT_CURRENCY?.trim().toUpperCase() || "AED";
}

export function getDisplayCurrency() {
  return process.env.DISPLAY_CURRENCY?.trim().toUpperCase() || "USD";
}

export function getAccountToDisplayRate() {
  const configured = Number.parseFloat(process.env.ACCOUNT_TO_DISPLAY_RATE || "");

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  const accountCurrency = getAccountCurrency();
  const displayCurrency = getDisplayCurrency();

  if (accountCurrency === displayCurrency) {
    return 1;
  }

  if (accountCurrency === "AED" && displayCurrency === "USD") {
    return DEFAULT_AED_TO_USD;
  }

  return 1;
}

export function convertAccountCurrencyAmount(amount: number) {
  return roundCurrency(amount * getAccountToDisplayRate());
}

export function formatDisplayCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: getDisplayCurrency(),
    style: "currency",
  }).format(amount);
}

export function formatDisplayCurrencyCompact(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: getDisplayCurrency(),
    notation: "compact",
    maximumFractionDigits: 1,
    style: "currency",
  }).format(amount);
}
