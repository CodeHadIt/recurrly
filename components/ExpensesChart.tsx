import cx from "clsx";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { BarChart, type barDataItem } from "react-native-gifted-charts";

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
  const barWidth = period === "weekly" ? 12 : period === "monthly" ? 18 : 22;
  const initialSpacing = period === "weekly" ? 18 : 22;
  const endSpacing = period === "weekly" ? 18 : 22;
  const availableTrackWidth = chartWidth - initialSpacing - endSpacing;
  const dynamicSpacing =
    data.length > 1
      ? Math.max(
          14,
          (availableTrackWidth - data.length * barWidth) / (data.length - 1),
        )
      : 0;
  const highestValue = Math.max(...data.map((item) => item.value), 0);
  const tallestBarIndex = data.findIndex((item) => item.value === highestValue);

  const chartData: barDataItem[] = data.map((item, index) => ({
    value: item.value,
    label: item.label,
    frontColor:
      index === tallestBarIndex && item.value > 0
        ? "#ea7a53"
        : item.isUnavailable
          ? "rgba(8, 17, 38, 0.14)"
          : "#081126",
    barBorderRadius: 999,
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
          key={period}
          data={chartData}
          width={chartWidth}
          height={240}
          maxValue={maxValue}
          noOfSections={4}
          overflowTop={36}
          initialSpacing={initialSpacing}
          endSpacing={endSpacing}
          spacing={dynamicSpacing}
          barWidth={barWidth}
          roundedTop
          roundedBottom
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisLabelWidth={48}
          rulesType="dashed"
          rulesColor="rgba(8, 17, 38, 0.08)"
          dashWidth={4}
          dashGap={5}
          rulesThickness={1}
          autoCenterTooltip
          focusedBarIndex={tallestBarIndex >= 0 ? tallestBarIndex : undefined}
          renderTooltip={(item: ExpensesChartPoint) => (
            <View style={{ alignItems: "center", paddingBottom: 8 }}>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#ea7a53",
                  }}
                >
                  ${Math.round(item.value)}
                </Text>
              </View>
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: "#FFFFFF",
                  transform: [{ rotate: "45deg" }],
                  marginTop: -5,
                }}
              />
            </View>
          )}
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
