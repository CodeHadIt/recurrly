import { PERIOD_VARIATIONS, STATUS_MULTIPLIERS } from "@/constants/data";
import dayjs from "dayjs";

export const getNiceChartMaxValue = (
  highestValue: number,
  sections: number,
): number => {
  if (!Number.isFinite(highestValue) || highestValue <= 0) {
    return sections * 10;
  }

  const roughStep = highestValue / sections;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const fraction = roughStep / magnitude;
  const niceFraction =
    fraction <= 1 ? 1
    : fraction <= 2 ? 2
    : fraction <= 2.5 ? 2.5
    : fraction <= 4 ? 4
    : fraction <= 5 ? 5
    : 10;

  return niceFraction * magnitude * sections;
};

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
      return ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"].map(
        (label, index) => ({
          label,
          index,
        }),
      );
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

const WEEKLY_REFERENCE_VALUES = [36, 31, 23, 40, 35, 21, 24];

const shapeWeeklyChartData = (data: ExpensesChartPoint[]) => {
  return data.map((item, index) => ({
    ...item,
    value: WEEKLY_REFERENCE_VALUES[index] ?? item.value,
  }));
};

const shapeYearlyChartData = (data: ExpensesChartPoint[]) => {
  const availableData = data.filter((item) => !item.isUnavailable);
  const yearlyProgression = [0.72, 0.84, 1];

  if (availableData.length === 0) {
    return data;
  }

  const currentYearValue = Math.max(
    840,
    Math.round(
      availableData.reduce((highestValue, item) => {
        return item.value > highestValue ? item.value : highestValue;
      }, 0),
    ),
  );

  let availableIndex = 0;

  return data.map((item) => {
    if (item.isUnavailable) {
      return item;
    }

    const multiplier =
      yearlyProgression[
        Math.min(availableIndex, yearlyProgression.length - 1)
      ] ?? 1;
    const nextItem = {
      ...item,
      value: Math.round(currentYearValue * multiplier),
    };

    availableIndex += 1;

    return nextItem;
  });
};

export const buildChartData = (
  subscriptions: Subscription[],
  period: ChartPeriod,
): ExpensesChartPoint[] => {
  const buckets = getPeriodBuckets(period);
  const variations = PERIOD_VARIATIONS[period];
  const earliestSubscriptionYear = subscriptions.reduce((earliestYear, subscription) => {
    const sourceDate = dayjs(
      subscription.startDate ?? subscription.renewalDate ?? dayjs().toISOString(),
    );
    const sourceYear = sourceDate.year();

    return sourceYear < earliestYear ? sourceYear : earliestYear;
  }, dayjs().year());

  const baseData = buckets.map((bucket) => {
    const isUnavailableYearBucket =
      period === "yearly" && Number(bucket.label) < earliestSubscriptionYear;

    if (isUnavailableYearBucket) {
      return {
        label: "N/A",
        value: 0,
        isUnavailable: true,
      };
    }

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
    };
  });

  if (period === "weekly") {
    return shapeWeeklyChartData(baseData);
  }

  if (period === "yearly") {
    return shapeYearlyChartData(baseData);
  }

  return baseData;
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
