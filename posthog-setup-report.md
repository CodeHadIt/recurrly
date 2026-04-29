<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Recurrly, a React Native Expo subscription management app. Here is a summary of all changes made:

- **`app.config.js`** (new): Created to extend `app.json` with PostHog `extra` config, reading `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from environment variables via `expo-constants`.
- **`src/config/posthog.ts`** (new): PostHog client singleton configured with app lifecycle tracking, batching, feature flags, and retry settings.
- **`app/_layout.tsx`**: Wrapped the app in `PostHogProvider`. Added manual screen tracking using `usePathname` + `useGlobalSearchParams` for Expo Router compatibility.
- **`app/(auth)/sign-in.tsx`**: Added `user_signed_in` event (with `method` property) and `mfa_code_sent` event. Added `posthog.identify()` on successful sign-in using Clerk user ID and email.
- **`app/(auth)/sign-up.tsx`**: Added `user_signed_up` event and `posthog.identify()` on successful email verification, including `signed_up_at` as a `$set_once` property.
- **`app/(tabs)/settings.tsx`**: Added `user_signed_out` event and `posthog.reset()` before Clerk sign-out.
- **`app/subscriptions/[id].tsx`**: Added `subscription_viewed` event with `subscription_id` property on component mount.
- **`.env.local`**: Populated `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (already `.gitignore`-covered).
- **`package.json`**: Added `posthog-react-native` and `react-native-svg` dependencies.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in (password or MFA). Includes `method` property. | `app/(auth)/sign-in.tsx` |
| `mfa_code_sent` | MFA email verification code sent during sign-in | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completes account creation and email verification | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_viewed` | User views a specific subscription detail page | `app/subscriptions/[id].tsx` |

Screen views are tracked automatically for all routes via `posthog.screen()` in `app/_layout.tsx`.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/391353/dashboard/1524379
- **Sign-up to Sign-in Funnel**: https://us.posthog.com/project/391353/insights/rl1Mr8aE
- **User Sign-ups Over Time**: https://us.posthog.com/project/391353/insights/9Asd83ht
- **Sign-ins Over Time** (by method): https://us.posthog.com/project/391353/insights/8jMS7ehb
- **User Churn — Sign-outs Over Time**: https://us.posthog.com/project/391353/insights/oyD5Emux
- **Subscription Views**: https://us.posthog.com/project/391353/insights/FIGuHS4W

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
