# Customizable Coat Rack Setup Guide

## Overview

This implementation provides a sophisticated customizable coat rack product section for Shopify that supports:
- **3 sizes**: 3 hooks, 6 hooks, 9 hooks
- **3 base colors**: Oak, White, Black
- **20 hook colors**: Full spectrum of colors with visual swatches
- **Layered image system**: Efficient image management with minimal assets
- **Real-time updates**: Dynamic price and image updates
- **Mobile optimization**: Touch-friendly controls and responsive design
- **Performance optimized**: Image preloading, caching, and smooth transitions

## Files Created

1. **`sections/customizable-coat-rack.liquid`** - Main product section template
2. **`assets/customizable-coat-rack.js`** - JavaScript functionality
3. **`assets/customizable-coat-rack.css`** - Additional CSS styles

## Image Requirements

### Base Rail Images
Create base rail images for each size and base color combination:

```
3-original-oak.png
3-original-white.png
3-original-black.png
6-original-oak.png
6-original-white.png
6-original-black.png
9-original-oak.png
9-original-white.png
9-original-black.png
```

### Hook Layer Images
Create individual hook overlay images using **RED** as the base color (the system will apply color transformations):

**For 3 hooks:**
```
3a-original-red.png (hook position 1)
3b-original-red.png (hook position 2)
3c-original-red.png (hook position 3)
```

**For 6 hooks:**
```
6a-original-red.png through 6f-original-red.png
```

**For 9 hooks:**
```
9a-original-red.png through 9i-original-red.png
```

### Image Specifications
- **Format**: PNG with transparency
- **Size**: 1000x1000px recommended
- **Background**: Transparent
- **Hook Color**: Always use RED (#FF0000) for hook images
- **Naming**: Exact naming convention is critical for functionality

## Shopify Product Setup

### 1. Create Product Variants

Set up Shopify product variants for each size:

```
Variant 1: "3 Hooks" - $X.XX
Variant 2: "6 Hooks" - $X.XX
Variant 3: "9 Hooks" - $X.XX
```

### 2. Upload Images

Upload all images to the Shopify Files section:
- Admin → Settings → Files
- Upload all base rail and hook layer images
- Ensure exact naming convention is followed

### 3. Create Product Template

1. In Shopify Admin → Online Store → Themes
2. Actions → Edit Code
3. Create new template: `templates/product.customizable-coat-rack.json`

```json
{
  "sections": {
    "main": {
      "type": "customizable-coat-rack",
      "settings": {}
    }
  },
  "order": ["main"]
}
```

### 4. Assign Template to Products

1. Go to Products → [Your Coat Rack Product]
2. In Theme Templates section, select "customizable-coat-rack"
3. Save

## Advanced Configuration

### Adding New Colors

To add new hook colors, update the color configuration in the section:

```javascript
// In customizable-coat-rack.liquid, update the CoatRackConfig
colors: {
  "new-color-key": { name: "New Color Name", hex: "#HEX_CODE" }
}
```

And add corresponding CSS filter in the section:

```css
.hook-layer[data-color="new-color-key"] {
  filter: hue-rotate(XXdeg) saturate(X.X) brightness(X.X);
}
```

### Color Filter Calculations

The system uses CSS filters to transform the red base images. Here's how to calculate filter values:

1. **Hue-rotate**: Degrees to shift from red (0°) to target color
2. **Saturate**: Intensity of color (0 = grayscale, 1+ = more vibrant)
3. **Brightness**: Lightness (0 = black, 1 = normal, 1+ = brighter)

Examples:
```css
/* Blue: Rotate 240° from red */
.hook-layer[data-color="blue"] { filter: hue-rotate(240deg) saturate(1.2) brightness(0.8); }

/* Green: Rotate 120° from red */
.hook-layer[data-color="green"] { filter: hue-rotate(120deg) saturate(1.3) brightness(0.7); }

/* Gray: Desaturate completely */
.hook-layer[data-color="gray"] { filter: saturate(0%) brightness(0.6); }
```

### Adding New Sizes

To add 12-hook support:

1. **Add variant** in Shopify for "12 Hooks"
2. **Create images**:
   - Base: `12-original-oak.png`, `12-original-white.png`, `12-original-black.png`
   - Hooks: `12a-original-red.png` through `12l-original-red.png`
3. **Update JavaScript** to handle 12-hook logic (already partially supported)

## Performance Optimization

### Image Optimization Tips

1. **Compress images** using tools like TinyPNG
2. **Use WebP format** where supported (requires theme modifications)
3. **Implement lazy loading** for non-critical images
4. **Preload critical images** (first size/color combinations)

### Browser Caching

The system implements intelligent image caching:
- Images are cached in memory after first load
- Critical images are preloaded on page load
- Failed image loads don't break the experience

## Accessibility Features

The implementation includes:
- **Keyboard navigation** support
- **Screen reader announcements** for selections
- **High contrast mode** support
- **Focus indicators** for all interactive elements
- **ARIA labels** and semantic HTML

## Mobile Optimization

- **Touch-friendly controls** with appropriate sizing
- **Responsive grid layouts** that adapt to screen size
- **Optimized image loading** for mobile bandwidth
- **Gesture support** for color selection

## Troubleshooting

### Images Not Loading
1. Check file naming exactly matches convention
2. Verify images are uploaded to Shopify Files
3. Check browser console for 404 errors
4. Ensure file paths in `imageBasePath` are correct

### Colors Not Changing
1. Verify CSS filters are correctly applied
2. Check browser support for CSS filters (IE11+ required)
3. Ensure hook images use red (#FF0000) as base color

### JavaScript Errors
1. Check browser console for error messages
2. Ensure `CoatRackConfig` is properly loaded
3. Verify all required DOM elements exist

### Performance Issues
1. Optimize image file sizes
2. Enable browser caching
3. Consider using a CDN for images
4. Monitor network requests in browser dev tools

## Browser Support

- **Modern browsers**: Full feature support
- **IE11**: Basic functionality (limited CSS filter support)
- **Mobile browsers**: Optimized experience
- **Safari**: Full support including touch interactions

## SEO Considerations

- Product URLs update with variant parameters
- Images include proper alt text
- Structured data is maintained
- Page performance is optimized for Core Web Vitals

## Testing Checklist

- [ ] All size options work correctly
- [ ] Base color changes update images
- [ ] Hook color selection works in both modes
- [ ] Mix and match functionality works
- [ ] Price updates correctly
- [ ] Cart integration works
- [ ] Mobile experience is smooth
- [ ] Images load quickly
- [ ] Accessibility features work
- [ ] Error states are handled gracefully

## Future Enhancements

Potential improvements for future versions:
1. **AR/VR preview** using Shopify's 3D model support
2. **Bulk ordering** for commercial customers
3. **Custom rail lengths** with dynamic pricing
4. **Save configurations** for repeat customers
5. **Share configurations** via URL parameters
6. **Integration with room visualizer** tools

## Support

For technical issues or customization requests:
1. Check browser console for error messages
2. Review this documentation thoroughly
3. Test with the troubleshooting steps above
4. Document specific steps to reproduce issues

---

**Note**: This system builds upon your existing coat rail infrastructure while adding modern features and performance optimizations. The layered image approach minimizes asset requirements while providing maximum customization flexibility.