# FFXIV PvP Calendar

Track the map rotation of Frontline and Crystalline Conflict in FFXIV PvP.

![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## Features

- 🗺️ **Real-time Map Display**: View the current active map for both Frontline and Crystalline Conflict
- ⏱️ **Live Countdown**: See exactly when the next rotation occurs (updates every second)
- 📅 **Frontline Calendar**: Browse past and future Frontline maps by date
- 📋 **CC Timeline**: View upcoming Crystalline Conflict maps for the next 30 hours
- 🌍 **Multi-language Support**: Available in Chinese (中文), Japanese (日本語), and English
- 🌙 **Dark/Light Mode**: Choose your preferred theme or follow system settings
- 🕐 **Timezone Support**: Automatically detects your timezone, with manual override option
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 💾 **Persistent Settings**: Your preferences are saved locally

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ffxiv-wakeng/pvp-calendar.git
cd pvp-calendar

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Build and deployment", select "GitHub Actions"
3. Push to the `main` branch to trigger deployment

### Manual Deployment

The build output is in the `dist` folder and can be deployed to any static hosting service.

## Adding Map Images

Map images should be placed in `public/maps/` with the following naming convention:

| Map ID | Filename |
|--------|----------|
| secure | `secure.webp` |
| seize | `seize.webp` |
| shatter | `shatter.webp` |
| naadam | `naadam.webp` |
| palaistra | `palaistra.webp` |
| volcanic | `volcanic.webp` |
| castletown | `castletown.webp` |
| bayside | `bayside.webp` |
| cloudnine | `cloudnine.webp` |
| redsands | `redsands.webp` |

Recommended image size: 376 × 120 pixels

## Maintenance Guide

### Rotation Logic

The rotation calculation is in `src/lib/rotation.ts`. Key constants:

```typescript
// Frontline: Rotates every 24 hours at 23:00 Beijing time (15:00 UTC)
FRONTLINE_REFERENCE_DATE = new Date('2025-07-16T15:00:00Z'); // When 'secure' starts
FRONTLINE_MAPS = ['secure', 'seize', 'shatter', 'naadam'];

// Crystalline Conflict: Rotates every 90 minutes
CC_REFERENCE_DATE = new Date('2026-01-09T15:00:00Z'); // When 'palaistra' starts
CC_MAPS = ['palaistra', 'volcanic', 'castletown', 'bayside', 'cloudnine', 'redsands'];
```

### Common Maintenance Tasks

#### Adding a New Map

1. Add the map ID to the appropriate array in `src/lib/rotation.ts`:
   ```typescript
   export const CC_MAPS: CCMap[] = [...existing, 'newmap'];
   ```

2. Add the map type:
   ```typescript
   export type CCMap = ... | 'newmap';
   ```

3. Add translations in `src/lib/i18n.ts` for all three languages:
   ```typescript
   maps: {
     newmap: 'New Map Name',
   },
   mapShort: {
     newmap: 'Short',
   }
   ```

4. Add the map image to `public/maps/newmap.webp`

5. Add gradient fallback in `src/components/MapCard.tsx`:
   ```typescript
   newmap: 'from-color-900/80 to-color-800/80',
   ```

#### Removing a Map

1. Remove from the maps array
2. Update the `REFERENCE_DATE` to a known time when the new rotation starts

#### Changing Rotation Order

1. Reorder the maps in the array
2. Update the `REFERENCE_DATE` to a known point where the first map in the new order starts

#### Changing Rotation Interval

1. Update `FRONTLINE_ROTATION_HOURS` or `CC_ROTATION_MINUTES`
2. Update the reference date if timing changed

### Translations

All text is in `src/lib/i18n.ts`. To add a new language:

1. Add the language type: `type Language = 'zh' | 'ja' | 'en' | 'xx';`
2. Add translations object with all keys
3. Add language option in `src/components/SettingsPanel.tsx`

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── CountdownTimer.tsx
│   ├── CrystallineConflictTab.tsx
│   ├── FrontlineTab.tsx
│   ├── Header.tsx
│   ├── MainContent.tsx
│   ├── MapCard.tsx
│   └── SettingsPanel.tsx
├── contexts/
│   └── SettingsContext.tsx
├── hooks/
│   └── useSettings.ts
├── lib/
│   ├── i18n.ts          # Translations
│   ├── rotation.ts      # Rotation logic
│   └── utils.ts
├── pages/
│   └── Index.tsx
├── App.tsx
└── main.tsx
```

## License

MIT

## Acknowledgments

- Square Enix for Final Fantasy XIV
- The FFXIV community for rotation information
