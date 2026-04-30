import type { ImageSourcePropType } from "react-native";

declare global {
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    frequency?: string;
    renewalDate?: string;
    color?: string;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  type ChartPeriod = "weekly" | "monthly" | "yearly";

  interface ExpensesChartPoint {
    label: string;
    value: number;
    frontColor?: string;
  }

  interface ExpensesSummary {
    title: string;
    totalExpenses: number;
    currency?: string;
    periodLabel: string;
    percentageGrowth: number;
    comparisonLabel: string;
  }

  interface ExpensesChartProps {
    period: ChartPeriod;
    onPeriodChange: (period: ChartPeriod) => void;
    data: ExpensesChartPoint[];
    maxValue: number;
    caption: string;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
  }
}

export { };
