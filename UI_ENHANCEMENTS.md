# UI Enhancements - Circuit Board & Snap-to-Grid

## Overview
Implemented circuit board graphics, snap-to-grid window management, and CRT monitor aesthetics to match the mockup design.

## Changes Made

### 1. Snap-to-Grid Window Management (pane-manager.js)

#### Added Properties:
```javascript
gridSize: 20,        // 20px grid
snapEnabled: true    // Enable snapping
```

#### New Functions:

**snapToGrid(value)** - Snaps any position/size value to 20px grid increments
```javascript
snapToGrid: function(value) {
  if (!this.snapEnabled) return value;
  return Math.round(value / this.gridSize) * this.gridSize;
}
```

**addCircuitPattern(container)** - Renders circuit board overlay on window container
- Creates canvas element covering full viewport
- Draws 40 circuit nodes with circles and crosshairs
- Connects nodes with 20 random trace lines
- Green (#00ff00) at 0.08 opacity
- Auto-resizes on window resize

#### Updated Functions:

**initialize()** - Container now fullscreen with grid background
- Position: fixed, 100vw x 100vh
- CSS gradient grid pattern (20px x 20px)
- Calls addCircuitPattern() to add canvas overlay

**updateDrag()** - Windows now snap during drag and resize
- Applies snapToGrid() to x/y positions during drag
- Applies snapToGrid() to width/height during resize
- Keeps windows within viewport bounds
- 20px increments for all movement and sizing

**createPane()** - Enhanced CRT monitor aesthetics
- Border-radius: 8px (rounded bezel)
- Backdrop-filter: blur(4px) (glass effect)
- Box-shadow: outer glow + inner glow
- Header gradient background (dark green → black)
- Enhanced title bar shadow

### 2. Circuit Board Graphics (technonomicon.js)

#### Enhanced Circuit Pattern:

**generateCircuitPattern()** - Updated to match mockup
- Grid-based node placement (40px spacing)
- Nodes: 3px filled circles with 8px crosshairs
- Connecting traces between adjacent nodes
- 30 random connection lines at 30% opacity
- Responsive canvas that resizes with window

#### Visual Improvements:
- Canvas opacity: 0.05 (subtle background)
- Page background: dark green gradient
- Border styling matches CRT aesthetic

### 3. Fullscreen Layout (index.html)

Already completed in previous session:
- body: 100vw width, overflow: hidden
- .crt-frame: 100vw x 100vh
- Removed max-width constraint

## Features Implemented

✅ **Snap-to-Grid Dragging**
- All windows snap to 20px grid during drag
- Smooth snapping with no visual jump
- Maintains window boundaries within viewport

✅ **Snap-to-Grid Resizing**
- Window dimensions snap to 20px increments
- Minimum size enforced (200x150)
- Grid-aligned sizing

✅ **Circuit Board Background**
- Full-screen canvas overlay with circuit pattern
- Nodes, crosshairs, and connecting traces
- Matches mockup aesthetic
- Responsive to window resize

✅ **CRT Monitor Styling**
- Rounded bezel edges (8px radius)
- Glass blur effect (backdrop-filter)
- Dual-layer glow (outer + inner)
- Gradient header backgrounds
- Enhanced shadows

✅ **Fullscreen Container**
- Windows container fills viewport (100vw x 100vh)
- Fixed positioning for layering
- Grid pattern visible on container
- No scrollbars or overflow

## How to Use

### Drag Windows:
- Click and hold window title bar
- Drag to new position
- Window automatically snaps to nearest 20px grid point
- Release to drop

### Resize Windows:
- Click and hold resize handle (bottom-right corner)
- Drag to new size
- Dimensions snap to 20px increments
- Release to finalize

### Visual Grid:
- Green grid pattern visible on background
- Circuit board overlay shows node connections
- Grid helps align windows visually

## Configuration

### Adjust Grid Size:
```javascript
// In pane-manager.js
gridSize: 20,  // Change to 10, 25, 40, etc.
```

### Toggle Snapping:
```javascript
// In pane-manager.js
snapEnabled: true,  // Set to false to disable
```

### Circuit Pattern Density:
```javascript
// In technonomicon.js generateCircuitPattern()
// Change loop spacing for grid density
for (let x = 0; x < canvas.width; x += 40) {  // 40 = grid spacing
  for (let y = 0; y < canvas.height; y += 40) {
    // Node drawing code
  }
}
```

### Circuit Connections:
```javascript
// In technonomicon.js generateCircuitPattern()
for (let i = 0; i < 30; i++) {  // 30 = number of connection lines
  // Draw random traces
}
```

## Files Modified

1. **pane-manager.js** (514 lines)
   - Added snap-to-grid logic
   - Added circuit pattern renderer
   - Enhanced CRT styling
   - Updated drag/resize handlers

2. **technonomicon.js** (453 lines)
   - Enhanced circuit background pattern
   - Grid-based node layout
   - Responsive canvas sizing

3. **index.html** (1420 lines)
   - Fullscreen layout (completed previously)

## Next Steps

### Docking System:
- [ ] Add edge detection (detect proximity to viewport edges)
- [ ] Implement magnetic docking (pull to edge when within 50px)
- [ ] Add dock zones (left panel, right panel, top bar, bottom bar)
- [ ] Visual indicators for dock targets

### Enhanced Snapping:
- [ ] Snap to other windows (window-to-window docking)
- [ ] Show snap guidelines during drag
- [ ] Highlight target grid cell on hover
- [ ] Add keyboard shortcuts (Ctrl+Arrow for grid nudge)

### Visual Polish:
- [ ] Animated circuit traces (pulsing lines)
- [ ] Window focus glow enhancement
- [ ] CRT scanline effect on windows
- [ ] Phosphor persistence effect

### Window Management:
- [ ] Maximize/restore functionality
- [ ] Snap to half-screen (left/right split)
- [ ] Window stacking management
- [ ] Minimize to taskbar

## Testing

Open index.html in browser and test:

1. **Grid Snapping:**
   - Drag Technonomicon window
   - Verify snaps to 20px increments
   - Check stays within viewport

2. **Resize Snapping:**
   - Grab resize handle
   - Resize window
   - Verify dimensions snap to grid

3. **Circuit Graphics:**
   - Check circuit pattern visible
   - Verify nodes and traces render
   - Test responsive resize

4. **CRT Styling:**
   - Check window glow effects
   - Verify header gradient
   - Test bezel appearance

All windows (Technonomicon, Character Status, Ancient Terminals, etc.) now have snap-to-grid and CRT styling.
