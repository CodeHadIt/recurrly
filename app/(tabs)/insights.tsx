import { styled } from "nativewind";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import UpcomingExpenses from "@/components/UpcomingExpenses";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  return (
    <SafeAreaView className="insights-screen">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 }}
      >
        <View className="insights-screen-header">
          <Text className="insights-screen-title">Insights</Text>
          <Text className="insights-screen-copy">
            Study your subscription load across short and long windows before
            upcoming renewals roll in.
          </Text>
        </View>

        <UpcomingExpenses />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
