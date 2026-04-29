import AppLoader from "@/components/AppLoader";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

const SubscriptionLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AppLoader message="Loading subscription details..." />;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default SubscriptionLayout;
