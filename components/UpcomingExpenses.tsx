import { useSubscriptionStore } from "@/lib/subscriptionStore";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import ExpensesChart from "./ExpensesChart";
import ExpensesSumCard from "./ExpensesSumCard";

const STATUS_MULTIPLIERS: Record<string, number> = {
  active: 1,
  paused: 0.58,
  cancelled: 0.22,
};

const PERIOD_VARIATIONS: Record<ChartPeriod, number[]> = {
  weekly: [0.82, 1.04, 0.93, 1.1, 1.18, 0.97, 1.06],
  monthly: [0.78, 0.9, 1.02, 0.96, 1.12, 1.2],
  yearly: [0.74, 0.88, 1.01, 1.16],
};

const PERIOD_CAPTIONS: Record<ChartPeriod, string> = {
  weekly:
    "A 7-day projection of renewal pressure based on your current subscription mix.",
  monthly:
    "A rolling 6-month view of recurring charges shaped by plan type, status, and billing cycle.",
  yearly:
    "A 4-year outlook that translates your current subscriptions into annual recurring spend.",
};

const getMonthlyEquivalent = (subscription: Subscription) => {
  const normalizedFrequency =
    subscription.frequency?.toLowerCase() ?? subscription.billing.toLowerCase();

  return normalizedFrequency === "yearly"
    ? subscription.price / 12
    : subscription.price;
};

const getBaseProjectedValue = (
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

const getPeriodBuckets = (period: ChartPeriod) => {
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

const buildChartData = (
  subscriptions: Subscription[],
  period: ChartPeriod,
): ExpensesChartPoint[] => {
  const buckets = getPeriodBuckets(period);
  const latestIndex = buckets.length - 1;
  const variations = PERIOD_VARIATIONS[period];

  return buckets.map((bucket) => {
    const totalValue = subscriptions.reduce((runningTotal, subscription, index) => {
      const baseValue = getBaseProjectedValue(subscription, period);
      const dateSeed = dayjs(
        subscription.startDate ?? subscription.renewalDate ?? dayjs().toISOString(),
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
    }, 0);

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

const buildSummary = (
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
      ? "Current weekly renewal projection"
      : period === "monthly"
        ? `Current month • ${dayjs().format("MMMM YYYY")}`
        : `Current year • ${dayjs().format("YYYY")}`;

  const comparisonLabel =
    period === "weekly"
      ? "Compared with the previous 7-day projection."
      : period === "monthly"
        ? "Compared with the previous month in your rolling trend."
        : "Compared with the previous yearly projection.";

  return {
    title: "Projected subscription spend",
    totalExpenses: currentValue,
    currency: "USD",
    periodLabel,
    percentageGrowth,
    comparisonLabel,
  };
};

const UpcomingExpenses = () => {
  const { subscriptions } = useSubscriptionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("weekly");

  const chartData = useMemo(
    () => buildChartData(subscriptions, selectedPeriod),
    [selectedPeriod, subscriptions],
  );

  const summary = useMemo(
    () => buildSummary(chartData, selectedPeriod),
    [chartData, selectedPeriod],
  );

  const maxValue = useMemo(() => {
    const highestValue = Math.max(...chartData.map((item) => item.value), 0);

    return Math.max(10, Math.ceil(highestValue / 5) * 5);
  }, [chartData]);

  return (
    <View className="expenses-panel">
      <View className="expenses-header">
        <Text className="expenses-kicker">Forecast</Text>
        <Text className="expenses-title">Subscription insights</Text>
        <Text className="expenses-copy">
          See how your recurring spend shifts across weekly, monthly, and
          yearly windows using the subscriptions currently in your workspace.
        </Text>
      </View>

      <ExpensesSumCard {...summary} />
      <ExpensesChart
        period={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        data={chartData}
        maxValue={maxValue}
        caption={PERIOD_CAPTIONS[selectedPeriod]}
      />
    </View>
  );
};

export default UpcomingExpenses;
