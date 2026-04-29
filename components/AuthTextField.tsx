import cx from "clsx";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  keyboardType?: TextInputProps["keyboardType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  textContentType?: TextInputProps["textContentType"];
  inputMode?: TextInputProps["inputMode"];
  maxLength?: number;
};

const INPUT_HORIZONTAL_PADDING = 12;
const INPUT_PASSWORD_RIGHT_PADDING = 64;

const AuthTextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secureTextEntry = false,
  editable = true,
  autoCapitalize = "none",
  autoComplete,
  keyboardType,
  returnKeyType,
  textContentType,
  inputMode,
  maxLength,
}: AuthTextFieldProps) => {
  const [isMasked, setIsMasked] = useState(secureTextEntry);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>

      <View className="relative">
        <TextInput
          className={cx(
            "auth-input",
            secureTextEntry && "pr-16",
            error && "auth-input-error",
            !editable && "opacity-70",
          )}
          style={{
            paddingLeft: INPUT_HORIZONTAL_PADDING,
            paddingRight: secureTextEntry
              ? INPUT_PASSWORD_RIGHT_PADDING
              : INPUT_HORIZONTAL_PADDING,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(8, 17, 38, 0.42)"
          secureTextEntry={secureTextEntry ? isMasked : false}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          textContentType={textContentType}
          inputMode={inputMode}
          maxLength={maxLength}
          selectionColor="#ea7a53"
        />

        {secureTextEntry ? (
          <Pressable
            className="absolute bottom-0 right-4 top-0 items-center justify-center"
            onPress={() => setIsMasked((current) => !current)}
            hitSlop={10}
          >
            <Text className="text-xs font-sans-semibold text-muted-foreground">
              {isMasked ? "Show" : "Hide"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
};

export default AuthTextField;
