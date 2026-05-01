import ListHeadings from "@/components/ListHeadings";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingExpenses from "@/components/UpcomingExpenses";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const getHistoryCadence = (subscription: Subscription) => {
  const normalizedFrequency =
    subscription.frequency?.toLowerCase() ?? subscription.billing.toLowerCase();

  return normalizedFrequency === "yearly"
    ? { unit: "year" as const, count: 2 }
    : { unit: "month" as const, count: 3 };
};

const buildPaymentHistory = (subscriptions: Subscription[]) => {
  return subscriptions
    .flatMap((subscription) => {
      const cadence = getHistoryCadence(subscription);
      const anchorDate = dayjs(
        subscription.renewalDate ??
          subscription.startDate ??
          dayjs().toISOString(),
      );

      return Array.from({ length: cadence.count }, (_, index) => {
        const sequence = index + 1;
        const paidOn = anchorDate.subtract(sequence, cadence.unit);
        const nextBill = paidOn.add(1, cadence.unit);

        return {
          ...subscription,
          id: `payment-${subscription.id}-${sequence}`,
          status: "paid",
          billing: "Paid",
          plan: `Settled ${paidOn.format("MMM D, YYYY")}`,
          startDate: paidOn.toISOString(),
          renewalDate: nextBill.toISOString(),
          color: index === 0 ? subscription.color : "#fff8e7",
        } satisfies Subscription;
      });
    })
    .sort((left, right) => dayjs(right.startDate).diff(dayjs(left.startDate)));
};

const Insights = () => {
  const { subscriptions } = useSubscriptionStore();
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(
    null,
  );

  const paymentHistory = useMemo(
    () => buildPaymentHistory(subscriptions),
    [subscriptions],
  );

  return (
    <SafeAreaView className="insights-screen">
      <FlatList
        data={paymentHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedPaymentId === item.id}
            onPress={() =>
              setExpandedPaymentId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        ListHeaderComponent={
          <View className="pt-6">
            <View className="insights-screen-header">
              <Text className="insights-screen-title">Monthly Insights</Text>
              <Text className="insights-screen-copy">
                Study your subscription load across short and long windows
                before upcoming renewals roll in.
              </Text>
            </View>

            <UpcomingExpenses />
            <ListHeadings title="History" />
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Insights;
