import { getAuthDisplayName } from "@/lib/auth";
import { useClerk, useUser } from "@clerk/expo";
import cx from "clsx";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const posthog = usePostHog();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5 py-6">
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
        <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
          Keep your workspace secure and up to date.
        </Text>

        <View className="mt-6 gap-4">
          <View className="rounded-2xl bg-background p-4">
            <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
              Signed in as
            </Text>
            <Text className="mt-2 text-lg font-sans-bold text-primary">
              {getAuthDisplayName(user)}
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? "No email available"}
            </Text>
          </View>

          <View className="rounded-2xl bg-background p-4">
            <Text className="text-sm font-sans-semibold text-primary">
              Session security
            </Text>
            <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
              Your session is stored securely so you can come back to your
              subscriptions without losing context.
            </Text>
          </View>

          <Pressable
            className={cx(
              "auth-button",
              isSigningOut && "auth-button-disabled",
            )}
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            <Text className="auth-button-text">
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
