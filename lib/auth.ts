import { isClerkAPIResponseError } from "@clerk/expo";

export type AuthFormErrors = Partial<
  Record<"email" | "password" | "confirmPassword" | "code" | "form", string>
>;

type DisplayableUser = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
} | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

const getMappedFieldName = (
  value?: string | null,
): keyof AuthFormErrors | null => {
  switch (value) {
    case "identifier":
    case "emailAddress":
    case "email_address":
      return "email";
    case "password":
      return "password";
    case "code":
      return "code";
    default:
      return null;
  }
};

export const getAuthDisplayName = (user?: DisplayableUser): string => {
  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();
  const username = user?.username?.trim();
  const email = user?.primaryEmailAddress?.emailAddress?.trim();

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (username) {
    return username;
  }

  if (email) {
    return email.split("@")[0];
  }

  return "there";
};

export const getClerkErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const parsedErrors = getClerkFieldErrors(error);

  return parsedErrors.form ?? fallback;
};

export const getClerkFieldErrors = (error: unknown): AuthFormErrors => {
  if (!isClerkAPIResponseError(error)) {
    if (error instanceof Error) {
      return { form: error.message };
    }

    return {};
  }

  return error.errors.reduce<AuthFormErrors>((accumulator, item) => {
    const message = item.longMessage ?? item.message;
    const fieldName = getMappedFieldName(item.meta?.paramName);

    if (fieldName && !accumulator[fieldName]) {
      accumulator[fieldName] = message;
    }

    if (!accumulator.form) {
      accumulator.form = message;
    }

    return accumulator;
  }, {});
};

export const validateEmailAddress = (value: string): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "Enter the email linked to your account.";
  }

  if (!EMAIL_PATTERN.test(normalizedValue)) {
    return "Enter a valid email address.";
  }

  return undefined;
};

export const validatePassword = (value: string): string | undefined => {
  if (!value) {
    return "Enter your password.";
  }

  if (value.length < 8) {
    return "Use at least 8 characters.";
  }

  if (!PASSWORD_LETTER_PATTERN.test(value) || !PASSWORD_NUMBER_PATTERN.test(value)) {
    return "Use a mix of letters and numbers.";
  }

  return undefined;
};

export const validateSignInValues = ({
  emailAddress,
  password,
}: {
  emailAddress: string;
  password: string;
}): AuthFormErrors => {
  const emailError = validateEmailAddress(emailAddress);
  const passwordError = password ? undefined : "Enter your password.";

  return {
    ...(emailError ? { email: emailError } : {}),
    ...(passwordError ? { password: passwordError } : {}),
  };
};

export const validateSignUpValues = ({
  emailAddress,
  password,
  confirmPassword,
}: {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}): AuthFormErrors => {
  const emailError = validateEmailAddress(emailAddress);
  const passwordError = validatePassword(password);
  const confirmPasswordError = !confirmPassword
    ? "Confirm your password."
    : password !== confirmPassword
      ? "Passwords do not match."
      : undefined;

  return {
    ...(emailError ? { email: emailError } : {}),
    ...(passwordError ? { password: passwordError } : {}),
    ...(confirmPasswordError ? { confirmPassword: confirmPasswordError } : {}),
  };
};

export const validateVerificationCode = (value: string): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "Enter the 6-digit code we sent you.";
  }

  if (!VERIFICATION_CODE_PATTERN.test(normalizedValue)) {
    return "Verification codes are 6 digits long.";
  }

  return undefined;
};
