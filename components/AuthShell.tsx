import images from "@/constants/images";
import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  eyebrow?: string;
};

const AuthShell = ({
  title,
  subtitle,
  children,
  eyebrow,
}: AuthShellProps) => {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="auth-screen">
        <Image
          source={images.splashPattern}
          className="absolute right-0 top-0 h-72 w-72 opacity-20"
          resizeMode="contain"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>

                  <View>
                    <Text className="auth-wordmark">Recurrly</Text>
                    <Text className="auth-wordmark-sub">Smart billing</Text>
                  </View>
                </View>

                {eyebrow ? (
                  <View className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2">
                    <Text className="text-[11px] font-sans-semibold uppercase tracking-[1px] text-accent">
                      {eyebrow}
                    </Text>
                  </View>
                ) : null}

                <Text className="mt-10 text-center auth-title">{title}</Text>
                {subtitle ? <Text className="auth-subtitle">{subtitle}</Text> : null}
              </View>

              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default AuthShell;
