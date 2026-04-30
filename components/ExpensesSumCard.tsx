import cx from "clsx";
import { formatCurrency } from "@/lib/utils";
import { Text, View } from "react-native";

const ExpensesSumCard = ({
  title,
  totalExpenses,
  currency,
  percentageGrowth,
  periodLabel,
  comparisonLabel,
}: ExpensesSummary) => {
  const isPositiveGrowth = percentageGrowth >= 0;
  const formattedGrowth = `${isPositiveGrowth ? "+" : ""}${percentageGrowth.toFixed(1)}%`;

  return (
    <View className="expenses-summary-card">
      <Text className="expenses-summary-kicker">{title}</Text>

      <View className="expenses-summary-row">
        <View className="flex-1">
          <Text className="expenses-summary-amount">
            {formatCurrency(totalExpenses, currency)}
          </Text>
          <Text className="expenses-summary-context">{periodLabel}</Text>
        </View>

        <View
          className={cx(
            "expenses-summary-trend",
            !isPositiveGrowth && "expenses-summary-trend-down",
          )}
        >
          <Text
            className={cx(
              "expenses-summary-trend-text",
              !isPositiveGrowth && "expenses-summary-trend-text-down",
            )}
          >
            {formattedGrowth}
          </Text>
        </View>
      </View>

      <Text className="expenses-summary-context">{comparisonLabel}</Text>
    </View>
  );
};

export default ExpensesSumCard;
