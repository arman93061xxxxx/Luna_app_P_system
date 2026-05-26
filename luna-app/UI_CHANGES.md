# Login & Signup UI Changes

## What Changed

### 1. **Single Video Playback**
- Video (`login.webm` or `login.mp4`) plays **only once** when the app loads
- Video does NOT replay when switching between Login and Signup
- Video pauses on the last frame showing the red blood circle

### 2. **Minimalist Field Design**
- **No boxes or cards** around input fields
- Fields appear **directly over the red blood circle** in the center
- Only **label text** and **underline** for each input
- Clean, transparent design with white text
- Underlines are 2px solid white with 80% opacity

### 3. **Seamless Screen Transitions**
- Clicking "Create account" switches from Login to Signup
- Clicking "Sign in" switches from Signup to Login
- **Only the form fields change** - video stays paused on last frame
- Smooth fade transitions between forms

### 4. **New Architecture**

#### **AuthScreen.js** (New Wrapper Component)
- Manages video playback (plays once)
- Handles navigation between Login/Signup
- Passes `videoFinished` state to child screens

#### **LoginScreen.js** (Updated)
- Removed video playback logic
- Receives `videoFinished` prop from AuthScreen
- Minimal styling - fields over video background
- Simple underlined inputs

#### **SignupScreen.js** (Updated)
- Removed video playback logic
- Receives `videoFinished` prop from AuthScreen
- Matches Login screen styling
- Includes Name, Email, Password, Age, Cycle Length fields

#### **AppNavigator.js** (Updated)
- Uses `AuthScreen` instead of separate Login/Signup routes
- Single entry point for authentication

## Visual Design

### Input Fields
```
LABEL TEXT (uppercase, white, 14px)
_________________________________
user input here (white, 18px)
```

### Button Style
- Semi-transparent white background (20% opacity)
- White border (50% opacity)
- Rounded corners (30px radius)
- White text, bold

### Color Scheme
- Text: White (#FFFFFF)
- Errors: Gold (#FFD700)
- Accents: Gold (#FFD700)
- Backgrounds: Transparent over video

## File Structure
```
src/
├── screens/
│   ├── AuthScreen.js       (NEW - Video wrapper)
│   ├── LoginScreen.js      (UPDATED - Minimal UI)
│   └── SignupScreen.js     (UPDATED - Minimal UI)
└── navigation/
    └── AppNavigator.js     (UPDATED - Uses AuthScreen)
```

## User Experience Flow

1. **App Opens** → Video plays automatically
2. **Video Ends** → Pauses on red blood circle
3. **Login Form Appears** → Fades in over the circle
4. **User Clicks "Create account"** → Form smoothly transitions to Signup
5. **User Clicks "Sign in"** → Form transitions back to Login
6. **Video Never Replays** → Stays on last frame throughout

## Technical Notes

- Video supports both `.webm` and `.mp4` formats
- Works on Web, iOS, and Android
- Uses React Native Reanimated for smooth animations
- Form validation remains unchanged
- Authentication logic unchanged
