import AuthShell from "@/components/AuthShell";
import AuthTextField from "@/components/AuthTextField";
import {
  getClerkErrorMessage,
  getClerkFieldErrors,
  validateSignUpValues,
  validateVerificationCode,
  type AuthFormErrors,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import cx from "clsx";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";

const SignUp = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({});

  const isVerificationStep = Boolean(
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0,
  );

  const subtitle = useMemo(() => {
    if (isVerificationStep) {
      return `Confirm ${emailAddress.trim() || "your email"} so we can finish setting up your account securely.`;
    }

    return undefined;
  }, [emailAddress, isVerificationStep]);

  const handleSubmit = async () => {
    const validationErrors = validateSignUpValues({
      emailAddress,
      password,
      confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    if (!signUp) {
      setFormErrors({
        form: "Account setup is still preparing. Please try again in a moment.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        setFormErrors(getClerkFieldErrors(error));
        return;
      }

      await signUp.verifications.sendEmailCode();
    } catch (error) {
      setFormErrors({
        ...getClerkFieldErrors(error),
        form: getClerkErrorMessage(
          error,
          "We couldn't start account creation right now. Please try again.",
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

    if (!signUp) {
      setFormErrors({
        form: "That verification session expired. Please create your account again.",
      });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              setFormErrors({
                form: "Your account needs one more security check before we can open your workspace.",
              });
              return;
            }

            posthog.identify(session?.user?.id ?? emailAddress.trim(), {
              $set: { email: emailAddress.trim() },
              $set_once: { signed_up_at: new Date().toISOString() },
            });
            posthog.capture("user_signed_up");
            router.replace("/");
          },
        });
        return;
      }

      setFormErrors({
        form: "That code did not complete setup. Request a new one and try again.",
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

  if (isSignedIn || signUp?.status === "complete") {
    return null;
  }

  return (
    <AuthShell
      eyebrow={isVerificationStep ? "Final step" : "Get started"}
      title={isVerificationStep ? "Verify your email" : "Create your account"}
      subtitle={subtitle}
    >
      <View className="auth-card">
        {isVerificationStep ? (
          <>
            <View className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
              <Text className="text-sm font-sans-medium text-primary">
                We sent a 6-digit code to{" "}
                <Text className="font-sans-bold text-primary">
                  {emailAddress.trim() || "your email"}
                </Text>
                . Once it is verified, your workspace is ready to go.
              </Text>
            </View>

            <View className="mt-5 auth-form">
              <AuthTextField
                label="Verification code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter 6-digit code"
                error={formErrors.code}
                helper="This keeps your account private and your data protected."
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
                onPress={() => signUp?.verifications.sendEmailCode()}
              >
                <Text className="auth-secondary-button-text">
                  Send a new code
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {/* <View className="mb-5 flex-row flex-wrap gap-2">
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Email verification
                </Text>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Secure sessions
                </Text>
              </View>
              <View className="rounded-full bg-background px-3 py-2">
                <Text className="text-xs font-sans-semibold text-primary">
                  Built for recurring spend
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
                placeholder="Create a password"
                error={formErrors.password}
                helper="Use at least 8 characters with a mix of letters and numbers."
                secureTextEntry
                editable={!isSubmitting}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
              />

              <AuthTextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                error={formErrors.confirmPassword}
                secureTextEntry
                editable={!isSubmitting}
                autoComplete="new-password"
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
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Text>
              </Pressable>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already with Recurrly?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </>
        )}
      </View>
    </AuthShell>
  );
};

export default SignUp;
