# Accessibility Features

## Overview
The DatSer app now includes comprehensive accessibility settings that allow users to customize their experience for performance, visual comfort, and navigation needs.

## How to Access
1. Click on your profile picture in the top-right corner
2. Click "Accessibility" in the Preferences section
3. Or navigate directly to `/accessibility` in the app

## Features Available

### 🚀 Performance Settings
- **Performance Mode**: Disables ALL animations and transitions for maximum speed
- **Animations Toggle**: Turn on/off visual animations and transitions
- **Reduced Motion**: Minimizes animations for users with motion sensitivity

### 👁️ Visual Settings
- **High Contrast**: Increases color contrast for better visibility
- **Focus Indicators**: Shows clear focus outlines for keyboard navigation
- **Dark Mode**: Reduces eye strain in low-light environments

### 📝 Typography Settings
- **Font Size**: Small (14px), Medium (16px), Large (18px), Extra Large (20px), XXL (24px)
- **Font Family**: Inter (default), System, Arial, Georgia, Courier New

## Quick Actions

### ⚡ Maximum Performance
One-click optimization that:
- Enables Performance Mode
- Disables all animations
- Enables Reduced Motion
- Perfect for slow devices or users who prefer speed

### ✨ Full Animations
Restores all visual effects:
- Disables Performance Mode
- Enables all animations
- Disables Reduced Motion
- Disables High Contrast

### 👁️ High Visibility
Optimizes for visual clarity:
- Enables High Contrast
- Sets font size to Extra Large
- Enables Focus Indicators

### 🔄 Reset All Settings
Clears all accessibility preferences and reloads the page

## Technical Implementation

### CSS Classes Applied
- `.animations-disabled`: Removes all animations and transitions
- `.reduced-motion`: Shortens animation durations
- `.high-contrast`: Increases color contrast
- `.focus-visible`: Shows enhanced focus indicators
- `.performance-mode`: Ultra-fast mode with no animations

### Storage
All settings are saved to `localStorage` and persist across sessions:
- `animationsEnabled`
- `reducedMotion`
- `highContrast`
- `focusVisible`
- `performanceMode`
- `fontSize`
- `fontFamily`

### Performance Impact
- **Performance Mode**: Eliminates all GPU animations for maximum speed
- **Reduced Motion**: Cuts animation times by 80%
- **High Contrast**: Minimal performance impact
- **Typography Changes**: Applied via CSS variables for efficiency

## Browser Compatibility
- Works on all modern browsers
- Respects `prefers-reduced-motion` system preference
- Compatible with screen readers
- Keyboard navigation friendly

## Mobile Optimizations
- Touch-friendly toggle switches
- Responsive layout for small screens
- Safe area support for notched devices
- Optimized for mobile performance

## Future Enhancements
- Voice control options
- Screen reader optimizations
- Color blind friendly palettes
- Dyslexia-friendly fonts
- Zoom level controls
