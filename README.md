# UNESCO Data Transit

An interactive subway/transit map visualization that gamifies the exploration of UNESCO's open datasets. Discover datasets by clicking on connected "stations" in a neon-styled network inspired by real transit maps.

![UNESCO Data Transit](https://img.shields.io/badge/Status-Prototype-orange) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Live Data**: Fetches real-time dataset information from UNESCO's Open Data API
- **Multi-Thematic Stations**: Datasets can belong to multiple themes (culture, science, education, information, global)
- **Progressive Discovery**: Gamified exploration - unlock new datasets by clicking connected stations
- **Rich Metadata**: View record counts, popularity scores, download statistics, and more
- **Neon Aesthetic**: Vibrant glow effects with enhanced visibility against dark backgrounds
- **Cartographic Background**: Realistic black/white map background with optimized contrast for transit line visibility

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173/` to start exploring the UNESCO data network.

## How It Works

### Dynamic Data Loading

The app fetches live data from UNESCO's monitoring API:

```text
https://data.unesco.org/api/explore/v2.1/monitoring/datasets/ods-datasets-monitoring/exports/json
```

### Configuration-Based Architecture

[`src/datasets-config.json`](src/datasets-config.json) defines:

- **Dataset positions** on the map (x, y coordinates)
- **Multi-thematic assignments** (e.g., SDG Indicators spans culture, science, education, and information)
- **Transit line connections** between datasets
- **Color schemes** for each thematic line

### Multi-Thematic Transfer Stations

Some datasets serve as "transfer stations" where multiple themes intersect:

- **SDG Indicators** (`sdg002`): Culture, Science, Education, Information
- **Member States** (`cou001`): Culture, Science, Education, Information
- **CO2 Emissions** (`co2001`): Culture, Science

## Project Structure

```text
Subway_Datahub/
├── public/
│   └── assets/
│       ├── images/
│       │   └── cartographic-background.png  # Black/white map background
│       └── icons/
│           └── subway-icon.svg              # Subway train icon for header
├── src/
│   ├── App.tsx                              # Main React component with API integration
│   ├── datasets-config.json                 # Dataset positions, themes, connections, colors
│   └── main.tsx                             # React entry point
├── index.html                               # HTML template
├── package.json                             # Dependencies and scripts
├── vite.config.ts                           # Vite configuration
├── tsconfig.json                            # TypeScript configuration
├── README.md                                # This file
├── CLAUDE.md                                # AI development guide
└── IMPLEMENTATION.md                        # Implementation details
```

## Adding New Datasets

1. Add to `datasets` array in [`src/datasets-config.json`](src/datasets-config.json):

    ```json
    {
      "dataset_id": "whc001",
      "themes": ["culture"],
      "position": { "x": 400, "y": 200 }
    }
    ```

1. Add connections to link it to other datasets:

    ```json
    { "from": "whc001", "to": "ich001", "line": "culture" }
    ```

1. The app automatically fetches dataset details (name, records, metadata) from the UNESCO API.

## Inspiration

- [Neon Subway Map by Jug Cerović](https://www.behance.net/gallery/1254165/Information-graphic-Neon-Subway-map) - Visual design inspiration
- [Mini Metro by Dinosaur Polo Club](https://dinopoloclub.com/games/mini-metro/) - Game mechanics and aesthetic

## Design Features

### Visual Design
- **Material Design Colors**: Professional color palette (#E91E63 for culture, #00BCD4 for education, etc.)
- **Enhanced Visibility**: 8px line width, 90% opacity, double-layer glow effects
- **Dark Cartographic Background**: 50% opacity map with 65% black overlay for optimal contrast
- **Station Markers**: 12-14px radius with colored rings for multi-thematic transfer stations
- **Smart Labels**: 11px font with black stroke and enhanced shadows for readability

### Technical Stack
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development server and optimized production builds
- **UNESCO Open Data API** for real-time dataset information
- **SVG** for crisp, scalable vector graphics and smooth animations
- **CSS-in-JS** for dynamic styling and theme management

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Development guide for AI assistants
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Detailed implementation notes

## License

Prototype/Proof-of-concept - Educational purposes
