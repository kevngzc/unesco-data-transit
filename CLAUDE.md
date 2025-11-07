# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UNESCO Data Transit** is an interactive visualization prototype that presents UNESCO datasets as a transit/subway map. Users discover datasets by clicking on connected "stations" in a gamified exploration experience inspired by Mini Metro and neon subway map aesthetics.

The project renders an SVG-based transit map with:
- **Stations**: UNESCO datasets (World Heritage, Intangible Heritage, Education Policies, etc.)
- **Transit Lines**: Thematic groupings (culture, education, science, information, global)
- **Discovery Mechanic**: Progressive revelation - users unlock new stations by clicking adjacent connected stations
- **Visual Style**: Neon colors with glow effects on a dark cartographic background

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (available at http://localhost:5173/)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Data Flow

```
UNESCO API → Fetch on mount → Map by dataset_id →
Merge with src/datasets-config.json (positions, themes) →
Organize by theme → Render SVG
```

The architecture separates concerns:
- **Configuration** ([src/datasets-config.json](src/datasets-config.json)): Static visual layout and multi-theme assignments
- **API Data** (UNESCO endpoint): Dynamic dataset metadata (titles, record counts, popularity)
- **Component** ([src/App.tsx](src/App.tsx)): Merges config + API data and renders interactive SVG

### Core Data Structures

**Dataset Interface** ([src/App.tsx:6-14](src/App.tsx#L6-L14))
```typescript
{
  id: string;           // UNESCO dataset ID (e.g., "whc001")
  name: string;         // Title from API
  records: number;      // Record count from API
  x: number;            // SVG X coordinate
  y: number;            // SVG Y coordinate
  themes: string[];     // Array of themes (can be multiple)
  apiData?: any;        // Full API response for this dataset
}
```

**Configuration Structure** ([src/datasets-config.json](src/datasets-config.json))
- `datasets`: Array of `{ dataset_id, themes[], position: {x, y} }`
- `connections`: Array of `{ from, to, line }` defining transit routes
- `lineColors`: Theme color mapping (e.g., `"culture": "#E91E63"`)

**Why Configuration is Needed**: The UNESCO API provides only one primary theme per dataset, but datasets like SDG Indicators or Member States span multiple themes. The config allows manual multi-theme assignment and precise visual positioning.

### State Management

React state ([src/App.tsx:16-23](src/App.tsx#L16-L23)):
- `discoveredStations`: Set of dataset IDs revealed by the user (starts with only `"whc001"`)
- `selectedStation`: Currently selected station for detail panel
- `animatingStations`: Stations currently animating into view
- `datasets`: Organized by theme `{ [theme: string]: Dataset[] }`
- `allStations`: Flat array of all merged datasets
- `loading`: API fetch status
- `error`: Error message if API fails

### Key Functions

**Data Loading** ([src/App.tsx:30-88](src/App.tsx#L30-L88))
1. Fetch from `https://data.unesco.org/api/explore/v2.1/monitoring/datasets/ods-datasets-monitoring/exports/json`
2. Create Map of API data by `dataset_id`
3. Merge each config entry with matching API data
4. Organize datasets by theme for rendering

**Discovery Mechanics**
- `getConnectedStations(stationId)`: Returns array of connected station IDs
- `isStationAccessible(stationId)`: Returns true if station is discovered OR has a discovered neighbor
- `discoverStation(stationId)`: Adds to discovered set with animation, sets as selected

**SVG Viewbox**: 900x700 coordinate system

## Working with This Codebase

### Adding New Datasets

1. **Add to config** ([src/datasets-config.json](src/datasets-config.json)):
   ```json
   {
     "dataset_id": "new001",
     "themes": ["education", "science"],
     "position": { "x": 450, "y": 300 }
   }
   ```

2. **Add connections**:
   ```json
   { "from": "new001", "to": "existing001", "line": "education" }
   ```

3. The app automatically fetches name, records, and metadata from the UNESCO API

### Modifying Visual Style

- **Line colors**: Edit `lineColors` in [src/datasets-config.json](src/datasets-config.json)
- **Glow effects**: SVG filters in `<defs>` section
- **Station rendering**: Multi-theme stations show colored rings for each theme
- **Cartographic background**: 50% opacity map with 65% black overlay for contrast

### Adding New Themes

1. Add color to `lineColors` in [src/datasets-config.json](src/datasets-config.json)
2. Assign datasets to the new theme in their `themes` array
3. Create connections with `"line": "new-theme-name"`

### Changing Game Mechanics

- **Accessibility logic**: Modify `isStationAccessible` to change which stations are clickable
- **Starting station**: Change initial `discoveredStations` Set in [src/App.tsx:17](src/App.tsx#L17)
- **Animation timing**: Adjust timeout in `discoverStation` function

## Technical Context

- **Stack**: Vite + React 18 + TypeScript
- **No tests**: This is a prototype/proof-of-concept
- **No linting**: Standard Vite + TypeScript strict mode only
- **TypeScript**: Strict mode enabled, no unused locals/parameters allowed
- **API**: Live data from UNESCO Open Data platform
- **Graphics**: Pure SVG rendering (no canvas or external charting libraries)

## External Resources

- Live dataset portal: `https://data.unesco.org/explore/dataset/{dataset_id}/`
- Design inspiration: Behance neon subway maps, Mini Metro game (see [README.md](README.md))
