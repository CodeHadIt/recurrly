import cx from "clsx";
import {
  BarChart,
  type barDataItem,
} from "react-native-gifted-charts";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

const PERIOD_OPTIONS: ChartPeriod[] = ["weekly", "monthly", "yearly"];
const PERIOD_LABELS: Record<ChartPeriod, string> = {
  weekly: "Week",
  monthly: "Month",
  yearly: "Year",
};

const ExpensesChart = ({
  period,
  onPeriodChange,
  data,
  maxValue,
  caption,
}: ExpensesChartProps) => {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 90, 260);

  const chartData: barDataItem[] = data.map((item, index) => ({
    value: item.value,
    label: item.label,
    frontColor: item.frontColor,
    barBorderRadius: 999,
    topLabelComponent:
      index === data.length - 1
        ? () => (
            <View
              style={{
                marginBottom: 8,
                alignSelf: "center",
                borderRadius: 999,
                backgroundColor: "#fff8e7",
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  color: "#ea7a53",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                ${Math.round(item.value)}
              </Text>
            </View>
          )
        : undefined,
  }));

  return (
    <View className="expenses-chart-shell">
      <View className="expenses-toggle">
        {PERIOD_OPTIONS.map((option) => {
          const isActive = option === period;

          return (
            <Pressable
              key={option}
              className={cx(
                "expenses-toggle-pill",
                isActive && "expenses-toggle-pill-active",
              )}
              onPress={() => onPeriodChange(option)}
            >
              <Text
                className={cx(
                  "expenses-toggle-text",
                  isActive && "expenses-toggle-text-active",
                )}
              >
                {PERIOD_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="expenses-chart-frame">
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          maxValue={maxValue}
          noOfSections={4}
          initialSpacing={18}
          endSpacing={18}
          spacing={period === "weekly" ? 34 : 26}
          barWidth={period === "weekly" ? 12 : 16}
          roundedTop
          roundedBottom
          hideOrigin
          xAxisThickness={0}
          yAxisThickness={0}
          rulesType="dashed"
          rulesColor="rgba(8, 17, 38, 0.08)"
          dashWidth={4}
          dashGap={5}
          rulesThickness={1}
          xAxisLabelTextStyle={{
            color: "#425c85",
            fontSize: 12,
            fontWeight: "600",
          }}
          yAxisTextStyle={{
            color: "#425c85",
            fontSize: 12,
            fontWeight: "500",
          }}
          yAxisLabelPrefix="$"
          showFractionalValues={false}
          disableScroll
          isAnimated
          animationDuration={650}
        />
      </View>

      <Text className="expenses-chart-caption">{caption}</Text>
    </View>
  );
};

export default ExpensesChart;
