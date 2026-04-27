export const formatCurrency = (
  value: number,
  currency: string = "USD"
): string => {
  const numericValue = Number(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

    return `$${safeValue.toFixed(2)}`;
  }
};
