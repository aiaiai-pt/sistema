# Warm Color Generation for Status Palettes

**Context:** Default Tailwind/design system status colors (red, green, blue, amber) are cold and clinical. The aiaiai system requires warm undertones throughout.

## Approach

Shift OKLCH hues toward warm territory while preserving perceptual lightness relationships:

| Color | Cold hue (Tailwind default) | Warm-shifted hue | Direction |
|-------|-----------------------------|-------------------|-----------|
| Red | ~25 (pure red) | ~30 (warm red, toward orange) | +5 |
| Green | ~150 (cool green) | ~145 (warm green, toward yellow-green) | -5 |
| Blue | ~260 (pure blue) | ~240 (teal-warm, toward cyan) | -20 |
| Amber | ~80 (already warm) | ~80 (minimal shift) | 0 |

### Process

1. Start from the neutral palette's warm undertone hue (~55 OKLCH)
2. For each status color, generate a 10-step scale (50-900) maintaining the same lightness curve as Tailwind's scale
3. Shift the hue toward the neutral's warm undertone
4. Verify contrast ratios: 500-700 steps must maintain 4.5:1 against surface colors

### Key Constraint

Never use Tailwind's default status colors as-is. They read as cold/clinical against warm neutrals. The shift is subtle (5-20 degrees) but perceptually significant when placed next to warm surfaces.

## Example: Green

```css
/* Cold (Tailwind default) */
--green-500: #22c55e;  /* hue ~150, very cool/minty */

/* Warm-shifted (aiaiai) */
--raw-color-green-500: #3daa33;  /* hue ~145, warmer/earthier */
```

The warm green reads as "growth/nature" rather than "terminal/success indicator."
