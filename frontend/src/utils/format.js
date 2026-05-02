export function formatMoney(value, currency = "KZT") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "KZT",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
