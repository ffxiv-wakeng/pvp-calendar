# AGENTS.md

FFXIV PvP Calendar - Track Frontline and Crystalline Conflict map rotations.

## Commands

```bash
npm run dev          # Dev server on port 3001
npm run build        # Production build to dist/
npm run build:dev    # Development build
npm run lint         # ESLint check
```

No test suite exists. No typecheck script - run `npx tsc --noEmit` manually.

## Architecture

- **Framework**: React 18 + Vite + TypeScript + Tailwind CSS
- **UI**: shadcn/ui components in `src/components/ui/` (Radix primitives)
- **Routing**: HashRouter (for GitHub Pages)
- **State**: React Context (`SettingsContext`) + `@tanstack/react-query`
- **PWA**: Full offline support with auto-update via `vite-plugin-pwa`
- **Deploy**: GitHub Pages via Actions on push to `master` (not `main`)

## Key Files

- `src/lib/rotation.ts` - Map rotation logic with reference dates
- `src/lib/i18n.ts` - All translations (zh, ja, en)
- `src/contexts/SettingsContext.tsx` - User preferences (theme, lang, timezone)
- `src/components/PWAPrompt.tsx` - Offline status and update notifications
- `vite.config.ts` - Uses `@` alias for `./src`, PWA configuration

## Rotation Logic

Rotation calculations depend on exact reference dates and map arrays. When modifying:

1. Update map arrays in `src/lib/rotation.ts` (FRONTLINE_MAPS or CC_MAPS)
2. Update translations in `src/lib/i18n.ts` (maps + mapShort objects)
3. Add map image to `public/maps/<mapid>.webp` (376x120px)
4. Update gradient in `src/components/MapCard.tsx`
5. Update `REFERENCE_DATE` if rotation order/timing changed

Frontline rotates every 24h at 15:00 UTC. CC rotates every 60min.

## PWA Configuration

PWA icons in `public/`:
- `pwa-192x192.png` - 192x192 icon
- `pwa-512x512.png` - 512x512 icon (also used for maskable)

To update icons, replace these PNG files. Recommended: use your logo with padding for maskable icons.

## TypeScript Config

Relaxed settings: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedLocals: false`.

## Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add <component>
```

Config in `components.json`. Uses default style, CSS variables, slate base color.
