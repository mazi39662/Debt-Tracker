# Debt Tracker

A mobile-friendly debt management app built with Vue 3, Ionic, and Capacitor. It helps you track debts, record payments, monitor balances, and review payment history in a simple dashboard.

## Features

- Add, edit, and remove debt records
- Track balances and payment history
- Record individual payments against debts
- View detailed debt information and payment logs
- Calendar-style overview for debt activity
- Mobile-first UI with Ionic components
- Local persistence using browser storage
- Android app support via Capacitor

## Tech Stack

- Vue 3
- Ionic Vue
- Vite
- TypeScript
- Pinia
- Capacitor
- Vitest + Cypress

## Project Structure

```bash
.
├── src/
│   ├── components/
│   ├── models/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── tests/
├── android/
├── capacitor.config.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Android Studio (for Android builds)

### Install Dependencies

```bash
npm install
```

### Run the App in Development Mode

```bash
npm run dev
```

This starts the Vite development server for local preview in the browser.

### Build the App

```bash
npm run build
```

### Run Unit Tests

```bash
npm run test:unit
```

### Run End-to-End Tests

```bash
npm run test:e2e
```

### Lint the Project

```bash
npm run lint
```

## Android Setup

This project includes Capacitor Android support.

To sync the native Android project:

```bash
npx cap sync android
```

Then open it in Android Studio:

```bash
npx cap open android
```

## Notes

- Data is stored locally in the app environment, so it persists within the app session and browser/device storage depending on implementation.
- The app is intended for personal finance tracking and debt monitoring.

## License

This project is currently unlicensed unless you add a license file and update this section.
