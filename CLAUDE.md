# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify theme codebase based on Dawn 15.2.0. The project follows Shopify's Liquid templating system with JavaScript enhancements for interactive functionality.

## Development Commands

- `npm run dev` - Start development server and watch for changes (connects to evhenii-test-store.myshopify.com)
- `npm run push` - Deploy theme changes to Shopify store
- `npm run pull` - Pull latest theme files from Shopify store

## Architecture

### Core Structure
- **assets/** - JavaScript, CSS, and static assets
  - `global.js` - Core JavaScript utilities (HTMLUpdateUtility, SectionId, focus management)
  - Component-specific JS files (cart.js, product-form.js, facets.js, etc.)
- **layout/** - Base template structure
  - `theme.liquid` - Main HTML layout with GTM integration
  - `password.liquid` - Password protection layout
- **sections/** - Reusable theme sections (announcement-bar, cart-drawer, etc.)
- **snippets/** - Reusable template components (card-product, buy-buttons, etc.)
- **templates/** - Page-specific templates with JSON configurations
- **config/** - Theme settings and configuration
  - `settings_schema.json` - Theme customization options
  - `settings_data.json` - Current theme settings
- **locales/** - Multi-language support (50+ locales with schema files)

### JavaScript Architecture
- Uses vanilla JavaScript with utility classes
- `HTMLUpdateUtility` class handles DOM updates with view transitions
- `SectionId` class manages Shopify section ID parsing
- Global focus management and accessibility features
- Component-based architecture (cart, product forms, search, etc.)

### Key Patterns
- Liquid templating with Shopify objects and filters
- JSON template configurations for flexible page layouts
- Modular JavaScript components loaded per page needs
- Multi-language support with translation keys (t: prefixes)
- Section-based theme architecture following Shopify 2.0 standards

## Store Configuration
- Store: evhenii-test-store.myshopify.com
- Theme ID: 180427489586

## File Extensions
- `.liquid` - Shopify Liquid template files
- `.json` - Template and configuration files
- `.js` - JavaScript assets
- `.css/.scss` - Styling (check assets for exact format used)

When working with this codebase:
- Follow Shopify Liquid templating conventions
- Use existing JavaScript utilities in global.js
- Maintain section-based architecture
- Consider multi-language support when adding new text
- Test changes using `npm run dev` before pushing to store