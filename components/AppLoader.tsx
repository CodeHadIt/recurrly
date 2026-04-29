import { ActivityIndicator, Text, View } from "react-native";

type AppLoaderProps = {
  message?: string;
};

const AppLoader = ({
  message = "Loading your workspace...",
}: AppLoaderProps) => {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>

        <View>
          <Text className="auth-wordmark">Recurrly</Text>
          <Text className="auth-wordmark-sub">Smart billing</Text>
        </View>
      </View>

      <ActivityIndicator color="#081126" />
      <Text className="mt-4 text-center text-sm font-sans-medium text-muted-foreground">
        {message}
      </Text>
    </View>
  );
};

export default AppLoader;
