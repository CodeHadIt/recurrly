# Recurrly

Recurrly is a personal expense tracker and spending analyzer built with React Native and Expo.

This project is also a learning playground for me as I get more hands-on with React Native, mobile UI patterns, routing, styling, and app architecture.

## About The App

The goal of Recurrly is to help track expenses, with a strong focus on recurring payments and subscriptions, and make it easier to understand where money is going over time.

The app is still a work in progress, but the direction is clear:

- Track recurring expenses and subscriptions
- Review upcoming charges
- Analyze spending habits
- Explore insights from expense data
- Practice building polished mobile experiences with React Native

## Current Status

This is an early-stage project and is actively being shaped.

What is already in the codebase:

- Expo Router-based app structure
- Bottom tab navigation
- Screens for Home, Subscriptions, Insights, and Settings
- Onboarding and auth route scaffolding
- Subscription detail route
- NativeWind/Tailwind-style styling setup
- Custom theme tokens, icons, and design assets

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo CLI tooling via `npx expo`

### Install

```bash
npm install
```

### Run The App

```bash
npm start
```

You can also run a platform-specific command:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Launch on Android
- `npm run ios` - Launch on iOS
- `npm run web` - Launch on web
- `npm run lint` - Run linting

## Project Structure

```text
app/
  (auth)/              Authentication routes
  (tabs)/              Main tab screens
  subscriptions/       Subscription detail routes
  onboarding.tsx       Onboarding screen
constants/
  data.ts              Tab and app data
  icons.ts             Icon exports
  theme.ts             Theme tokens
assets/
  fonts/               Local fonts
  icons/               UI and brand icons
  images/              App images
globals.css            NativeWind theme and shared styles
```

## Why I Built This

I wanted a project that lets me learn React Native by building something practical. Expense tracking felt like a good fit because it combines:

- Real UI work
- Navigation and screen flow
- State and data modeling
- Visual analytics
- Mobile-first design decisions

## Roadmap

Some features I plan to add next:

- Add and manage expenses
- Track subscriptions by billing cycle
- Spending summaries and charts
- Category-based analysis
- Local storage or backend integration
- Notifications or payment reminders
- Better onboarding and authentication flows

## Notes

This app is currently a pet project for learning and experimentation, so parts of the UI and feature set may change often as I improve the architecture and polish the experience.
