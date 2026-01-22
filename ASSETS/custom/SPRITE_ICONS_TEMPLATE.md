# Sprite Icons Template Guide

## Sprite Sheet Specifications

**File:** `ASSETS/custom/sprite-icons.png`
**Grid:** 8 columns × 7 rows
**Icon Size:** 32×32 pixels each
**Total Size:** 256×224 pixels

## Layout Map

```
    Col0    Col1    Col2    Col3    Col4    Col5    Col6    Col7
    (0px)   (32px)  (64px)  (96px)  (128px) (160px) (192px) (224px)
    ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┬───────┐
Row0│  ✕    │  ⬈    │  ⬋    │  🔊   │  🔇   │  🎤   │  ⬢    │  ✦    │ UI Controls
(0) │ close │popout │ popin │sound  │ mute  │  mic  │  hex  │ star4 │
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row1│  🎲   │  ⚔    │  ✨    │  🌟   │  🔮   │  ⚙    │  ▲    │  ☠    │ Game/Prompts
(32)│ dice  │combat │sparkle│ star  │crystal│ gear  │forest │ skull │
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row2│  ✓    │  ✗    │  ⚠    │  ▶    │  ➤    │  ○    │  ►    │  ⚗    │ Status
(64)│ check │ cross │warning│ play  │pointer│circle │ quest │potion │
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row3│  ⚡   │  💾   │  🔓   │  🔒   │  📖   │  ◊    │  ◆    │  □    │ Inventory
(96)│light- │ save  │unlock │ lock  │ book  │diamond│diam-f │square │
    │ning   │       │       │       │       │       │       │       │
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row4│  ◉    │  •    │  ←    │  →    │  ↑    │  ↓    │  ⏳   │  ✅   │ Arrows/Misc
(128)│ dot  │bullet │ left  │ right │  up   │ down  │hour-  │success│
    │       │       │       │       │       │       │glass  │       │
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row5│  ❌   │  🧪   │  📜   │  🎮   │       │       │       │       │ Extra
(160)│ fail │ test  │scroll │gamepad│ (free)│ (free)│ (free)│ (free)│
    ├───────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤
Row6│  ╔    │  ╗    │  ╚    │  ╝    │  ═    │  ║    │  █    │  ░    │ Box Drawing
(192)│box-tl│box-tr │box-bl │box-br │ box-h │ box-v │ block │ shade │ (optional)
    └───────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘
```

## Style Guide

### Recommended Aesthetic
- **CRT/Retro Terminal** - Green phosphor glow on black
- **Pixel Art** - Clean, readable at 32x32
- **Limited Palette** - Match game colors:
  - Primary: `#00ff00` (terminal green)
  - Secondary: `#88ff00` (lime)
  - Accent: `#ffaa00` (amber/gold)
  - Warning: `#ff4444` (red)
  - Magic: `#aa77ff` (purple)
  - Oracle: `#c9a227` (gold)

### Icon Design Tips
1. **1-2px outline** for visibility on dark backgrounds
2. **Glow effect** (optional) - slight green halo
3. **Consistent stroke weight** across all icons
4. **Leave 2px padding** on each side (28x28 active area)

## How It Works

1. **sprite-icons.css** defines the sprite positions
2. **sprite-icons.js** automatically finds emojis in the DOM
3. Emojis get replaced with `<span class="icon icon-dice"></span>`
4. CSS displays the correct portion of the sprite sheet

## Testing

Once you have the sprite sheet:
1. Place it at `ASSETS/custom/sprite-icons.png`
2. Refresh the game
3. All emojis should be replaced with your pixel art!

## Disabling (to see original emojis)

In browser console:
```javascript
SpriteIcons.setEnabled(false);
```

## Adding New Icons

1. Add icon to sprite sheet at next available slot
2. Add CSS class in `sprite-icons.css`:
   ```css
   .icon-newicon { background-position: -Xpx -Ypx; }
   ```
3. Add mapping in `sprite-icons.js`:
   ```javascript
   '🆕': 'newicon',
   ```
