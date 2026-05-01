import { formatCurrency } from "@/lib/utils";
import cx from "clsx";
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
    <View className="expenses-summary-card expenses-head">
      <View>
        <Text className="sub-title">{title}</Text>
        <Text className="sub-meta">{periodLabel}</Text>
      </View>

      <View className="sub-price-box">
        <Text className="sub-price">
          {formatCurrency(totalExpenses, currency)}
        </Text>
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

      {/* <Text className="expenses-summary-context">{comparisonLabel}</Text> */}
    </View>
  );
};

export default ExpensesSumCard;
