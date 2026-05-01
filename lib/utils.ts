import { PERIOD_VARIATIONS, STATUS_MULTIPLIERS } from "@/constants/data";
import dayjs from "dayjs";

export const formatCurrency = (
  value: number,
  currency: string = "USD",
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

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getMonthlyEquivalent = (subscription: Subscription) => {
  const normalizedFrequency =
    subscription.frequency?.toLowerCase() ?? subscription.billing.toLowerCase();

  return normalizedFrequency === "yearly"
    ? subscription.price / 12
    : subscription.price;
};

export const getBaseProjectedValue = (
  subscription: Subscription,
  period: ChartPeriod,
) => {
  const statusMultiplier =
    STATUS_MULTIPLIERS[subscription.status ?? "active"] ?? 1;
  const monthlyEquivalent = getMonthlyEquivalent(subscription);

  switch (period) {
    case "weekly":
      return (monthlyEquivalent / 4.35) * statusMultiplier;
    case "yearly":
      return monthlyEquivalent * 12 * statusMultiplier;
    case "monthly":
    default:
      return monthlyEquivalent * statusMultiplier;
  }
};

export const getPeriodBuckets = (period: ChartPeriod) => {
  switch (period) {
    case "weekly":
      return Array.from({ length: 7 }, (_, index) => {
        const date = dayjs().subtract(6 - index, "day");

        return {
          label: date.format("ddd"),
          index,
        };
      });
    case "yearly":
      return Array.from({ length: 4 }, (_, index) => {
        const date = dayjs().subtract(3 - index, "year");

        return {
          label: date.format("YYYY"),
          index,
        };
      });
    case "monthly":
    default:
      return Array.from({ length: 6 }, (_, index) => {
        const date = dayjs().subtract(5 - index, "month");

        return {
          label: date.format("MMM"),
          index,
        };
      });
  }
};

export const buildChartData = (
  subscriptions: Subscription[],
  period: ChartPeriod,
): ExpensesChartPoint[] => {
  const buckets = getPeriodBuckets(period);
  const latestIndex = buckets.length - 1;
  const variations = PERIOD_VARIATIONS[period];

  return buckets.map((bucket) => {
    const totalValue = subscriptions.reduce(
      (runningTotal, subscription, index) => {
        const baseValue = getBaseProjectedValue(subscription, period);
        const dateSeed = dayjs(
          subscription.startDate ??
            subscription.renewalDate ??
            dayjs().toISOString(),
        );
        const seed =
          subscription.name.length + index + dateSeed.month() + dateSeed.date();
        const variation = variations[(bucket.index + seed) % variations.length];
        const categoryBoost =
          subscription.category === "AI Tools"
            ? 1.08
            : subscription.category === "Design"
              ? 1.04
              : 1;

        return runningTotal + baseValue * variation * categoryBoost;
      },
      0,
    );

    return {
      label: bucket.label,
      value: Number(totalValue.toFixed(2)),
      frontColor:
        bucket.index === latestIndex
          ? "#ea7a53"
          : bucket.index % 2 === 0
            ? "#081126"
            : "#15284d",
    };
  });
};

export const buildSummary = (
  data: ExpensesChartPoint[],
  period: ChartPeriod,
): ExpensesSummary => {
  const currentValue = data[data.length - 1]?.value ?? 0;
  const previousValue = data[data.length - 2]?.value ?? currentValue;
  const percentageGrowth =
    previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

  const periodLabel =
    period === "weekly"
      ? "This Week"
      : period === "monthly"
        ? `${dayjs().format("MMMM YYYY")}`
        : `${dayjs().format("YYYY")}`;

  const comparisonLabel =
    period === "weekly"
      ? "Compared with the previous 7-day projection."
      : period === "monthly"
        ? "Compared with the previous month in your rolling trend."
        : "Compared with the previous yearly projection.";

  return {
    title: "Expenses",
    totalExpenses: currentValue,
    currency: "USD",
    periodLabel,
    percentageGrowth,
    comparisonLabel,
  };
};
