# Monorepo: React Native + Django

A full-stack mobile app built with **React Native** (Expo), **Django** backend, using **pnpm**, **Nativewind**, and **Gluestack UI**.

## 🏗️ Tech Stack

| Component | Technology |
|-----------|------------|
| **native-app** | React Native + Expo |
| **Backend** | Django + Django REST Framework |
| **Package Manager** | pnpm |
| **Styling** | Nativewind (Tailwind CSS for React Native) |
| **UI Components** | Gluestack UI |
| **Development** | Expo Go (SDK 55) |

## 📁 Project Structure
```bash
apps/
├── native-app/                 # React Native Expo app
│   ├── app/                    # File-based routing (Expo Router)
│   ├── components/             # Gluestack UI components
│   ├── app.json                # Expo config
│   └── package.json
│
├── backend/                        # Backend
│   ├── manage.py
│   ├── config/
│   ├── requirements.txt
│   └── api/            # Django apps
│
```


## 🚀 Prerequisites

- **Node.js** (v18+) with **pnpm** installed globally
  ```bash
  npm install -g pnpm
  ```
- **Expo Go** app on your mobile device (requires **SDK 55**)
- **Python** 3.9+ for Django backend
- **Git Bash** (recommended for Windows users)

## 📦 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd reactNative_app
```

### 2. Install mobile dependencies
```bash
cd apps/native-app
pnpm install
```

### 3. Install backend dependencies
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 🏃‍♂️ Running the Project

### Mobile App (React Native + Expo) + Backend server

```bash
// root directory
pnpm run dev
```

**Important:**
- Download **Expo Go** from [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779) or [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Required SDK version: 55**
- Scan the QR code from the terminal output with Expo Go app


 ## [Download this app APK](https://expo.dev/accounts/yushna417s-organization/projects/learn_ReactNative/builds/13e1ad0e-43b3-4b46-b261-4910d2a15ab8)



## Build & Create APK in React Native Expo
### 1. **Install EAS CLI**
   ```bash
   pnpm install -g eas-cli
   ```

### 2. **Login to Expo**
   ```bash
   eas login
   ```

### 3. **Go to Expo App Folder**
   ```bash
   cd apps/mobile-app
   ```

### 4. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

   This creates:  `eas.json`

### 5. **Build Android APK**

   ### Preview APK (Recommended for testing)

   ```bash
   eas build --platform android --profile preview
   ```

### 6. **Download APK**

   After build completes:
   - Expo gives a download URL
   - Open it
   - Download the APK

---


## 🛠️ Available Scripts

### Mobile (`native-app/`)
```bash
pnpm start          # Start Expo dev server
pnpm expo start     # Same as above
pnpm expo:ios       # Run on iOS simulator
pnpm expo:android   # Run on Android emulator
pnpm expo build:apk # Build APK
```

### Backend (`backend/`)
```bash
python manage.py runserver    # Start Django server
python manage.py migrate      # Run database migrations
python manage.py createsuperuser  # Create admin user
```

## 🎨 UI Components

This project uses **Gluestack UI** with **Nativewind** for styling:

```tsx
import { Button, Text } from '@gluestack-ui/themed';
import { View } from 'react-native';

<View className="flex-1 items-center justify-center bg-background">
  <Button action="primary" size="lg">
    <Text>Hello Gluestack!</Text>
  </Button>
</View>
```
