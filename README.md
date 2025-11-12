# Card App - Flashcard Application

A mobile flashcard application built with CapacitorJS, Vite, React, and TypeScript.

## Features

- Create, edit, and delete flashcards
- Persistent storage using Capacitor Storage
- Mobile-ready with CapacitorJS

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- For mobile development: Android Studio (Android) or Xcode (iOS)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Mobile Development (see more at [Android](https://capacitorjs.com/docs/android) and [IOS](https://capacitorjs.com/docs/ios)) 

### Add Platforms

```bash
# Add Android
npm run cap:add android

# Add iOS 
npm run cap:add ios
```

### Sync and Run

```bash

npm run cap:sync

npm run cap:open

npm run cap:run android
npm run cap:run ios
```
