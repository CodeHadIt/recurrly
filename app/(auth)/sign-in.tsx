import AuthShell from "@/components/AuthShell";
import AuthTextField from "@/components/AuthTextField";
import {
  getClerkErrorMessage,
  getClerkFieldErrors,
  validateSignInValues,
  validateVerificationCode,
  type AuthFormErrors,
} from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import cx from "clsx";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";

const SignIn = () => {
  const router = useRouter();
  const { signIn } = useSignIn();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({});

  const isVerificationStep = signIn?.status === "needs_client_trust";

  const subtitle = useMemo(() => {
    if (isVerificationStep) {
      return `Enter the 6-digit code sent to ${emailAddress.trim() || "your email"} to finish signing in securely.`;
    }

    return "Sign in to keep every renewal, payment, and spending trend in one calm place.";
  }, [emailAddress, isVerificationStep]);

  const handleSubmit = async () => {
    const validationErrors = validateSignInValues({ emailAddress, password });

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    if (!signIn) {
      setFormErrors({
        form: "Secure sign in is still warming up. Please try again in a moment.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        setFormErrors(getClerkFieldErrors(error));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              setFormErrors({
                form: "Your account needs one more security check before we can open your workspace.",
              });
              return;
            }

            posthog.identify(session?.user?.id ?? emailAddress.trim(), {
              $set: { email: emailAddress.trim() },
            });
            posthog.capture("user_signed_in", { method: "password" });
            router.replace("/");
          },
        });
        return;
      }

      if (signIn.status === "needs_client_trust") {
        await signIn.mfa.sendEmailCode();
        posthog.capture("mfa_code_sent", { method: "email" });
        return;
      }

      setFormErrors({
        form: "We couldn't complete sign in. Please review your details and try again.",
      });
    } catch (error) {
      setFormErrors({
        ...getClerkFieldErrors(error),
        form: getClerkErrorMessage(
          error,
          "We couldn't sign you in right now. Please try again shortly.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const codeError = validateVerificationCode(code);

    if (codeError) {
      setFormErrors({ code: codeError });
      return;
    }

    if (!signIn) {
      setFormErrors({
        form: "The verification session has expired. Please start again.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              setFormErrors({
                form: "Your account needs one more security check before we can open your workspace.",
              });
              return;
            }

            posthog.identify(session?.user?.id ?? emailAddress.trim(), {
              $set: { email: emailAddress.trim() },
            });
            posthog.capture("user_signed_in", { method: "password_mfa" });
            router.replace("/");
          },
        });
        return;
      }

      setFormErrors({
        form: "That code didn't complete sign in. Request a new one and try again.",
      });
    } catch (error) {
      setFormErrors({
        ...getClerkFieldErrors(error),
        form: getClerkErrorMessage(
          error,
          "We couldn't verify that code. Please try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = async () => {
    if (!signIn) return;

    setCode("");
    setFormErrors({});
    await signIn.reset();
  };

  return (
    <AuthShell
      eyebrow={isVerificationStep ? "Secure check" : "Welcome back"}
      title={isVerificationStep ? "Check your inbox" : "Sign in"}
      subtitle={subtitle}
    >
      <View className="auth-card">
        {isVerificationStep ? (
          <>
            <View className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
              <Text className="text-sm font-sans-medium text-primary">
                A fresh code is on its way to{" "}
                <Text className="font-sans-bold text-primary">
                  {emailAddress.trim() || "your email"}
                </Text>
                . Enter it below to continue into your billing dashboard.
              </Text>
            </View>

            <View className="mt-5 auth-form">
              <AuthTextField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter 6-digit code"
                error={formErrors.code}
                helper="Codes usually arrive within a few seconds."
                editable={!isSubmitting}
                keyboardType="number-pad"
                inputMode="numeric"
                textContentType="oneTimeCode"
                returnKeyType="done"
                maxLength={6}
              />

              {formErrors.form ? (
                <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <Text className="auth-error">{formErrors.form}</Text>
                </View>
              ) : null}

              <Pressable
                className={cx(
                  "auth-button",
                  isSubmitting && "auth-button-disabled",
                )}
                disabled={isSubmitting}
                onPress={handleVerify}
              >
                <Text className="auth-button-text">
                  {isSubmitting ? "Verifying..." : "Verify and continue"}
                </Text>
              </Pressable>

              <Pressable
                className="auth-secondary-button"
                disabled={isSubmitting}
                onPress={() => signIn?.mfa.sendEmailCode()}
              >
                <Text className="auth-secondary-button-text">
                  Send a new code
                </Text>
              </Pressable>

              <Pressable
                className="items-center py-1"
                disabled={isSubmitting}
                onPress={handleRestart}
              >
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  Start over
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* <View className="mb-5 flex-row flex-wrap gap-2">
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Private session
                </Text>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Billing history intact
                </Text>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Fast resume
                </Text>
              </View>
            </View> */}

            <View className="auth-form">
              <AuthTextField
                label="Email"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="Enter your email"
                error={formErrors.email}
                editable={!isSubmitting}
                autoComplete="email"
                keyboardType="email-address"
                inputMode="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />

              <AuthTextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                error={formErrors.password}
                helper="Use the same password you set when creating your account."
                secureTextEntry
                editable={!isSubmitting}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
              />

              {formErrors.form ? (
                <View className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <Text className="auth-error">{formErrors.form}</Text>
                </View>
              ) : null}

              <Pressable
                className={cx(
                  "auth-button",
                  isSubmitting && "auth-button-disabled",
                )}
                disabled={isSubmitting}
                onPress={handleSubmit}
              >
                <Text className="auth-button-text">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Text>
              </Pressable>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurrly?</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </>
        )}
      </View>
    </AuthShell>
  );
};

export default SignIn;
