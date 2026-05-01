import { PERIOD_CAPTIONS } from "@/constants/data";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { buildChartData, buildSummary } from "@/lib/utils";
import { useMemo, useState } from "react";
import { View } from "react-native";
import ExpensesChart from "./ExpensesChart";
import ExpensesSumCard from "./ExpensesSumCard";
import ListHeadings from "./ListHeadings";

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
    <View className="">
      <ListHeadings title="Upcoming" />

      <ExpensesChart
        period={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        data={chartData}
        maxValue={maxValue}
        caption={PERIOD_CAPTIONS[selectedPeriod]}
      />

      <ExpensesSumCard {...summary} />
    </View>
  );
};

export default UpcomingExpenses;
