---
name: Profile Org Website
description: An editable organization profile website
colors:
  primary: "#a3d900"
  primary-hover: "#8cbf00"
  primary-dark: "#6d9500"
  primary-soft: "#f4fce3"
  accent: "#f59e0b"
  accent-soft: "#fef3c7"
  navy: "#0a0f0d"
  bg-white: "#ffffff"
  bg-light: "#f9fbf5"
  bg-section: "#f3f6ed"
  text-dark: "#0a0f0d"
  text-body: "#3f4a38"
  text-muted: "#7c8a72"
  border: "#dbe3d2"
typography:
  display:
    fontFamily: "'Inter', 'Noto Sans Thai', sans-serif"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "'Inter', 'Noto Sans Thai', sans-serif"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "'Inter', 'Noto Sans Thai', sans-serif"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Inter', 'Noto Sans Thai', sans-serif"
    fontWeight: 700
    letterSpacing: "2.5px"
rounded:
  md: "12px"
  lg: "18px"
  full: "100px"
spacing:
  section: "80px"
components:
  btn-main:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primary-hover})"
    textColor: "{colors.navy}"
    rounded: "{rounded.full}"
    padding: "12px 30px"
  btn-main-hover:
    backgroundColor: "linear-gradient(135deg, {colors.primary-hover}, {colors.primary-dark})"
    textColor: "#ffffff"
  btn-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.full}"
    padding: "10.5px 28px"
---

# Design System: Profile Org Website

## 1. Overview

**Creative North Star: "The Neon Terminal"**

This visual system embodies high contrast, striking energy, and modern execution. It balances the starkness of a deep navy/black canvas with vibrant, almost electric bursts of lime green. It avoids the soft, muted tones often found in typical SaaS or AI-generated sites, opting instead for a bold, unabashed tech-forward aesthetic.

**Key Characteristics:**
- High contrast and unmistakable hierarchy.
- Saturated electric lime accents against deep darks and stark whites.
- Luminous hover states with layered glowing shadows.
- Sharp, modern typography combining Inter and Noto Sans Thai.

## 2. Colors

The palette is driven by the extreme contrast between the Electric Lime and deep Navy.

### Primary
- **Electric Lime** (#a3d900): The core brand color. Used for primary buttons, active states, glowing badges, and key call-to-actions. High-energy and unapologetic.

### Secondary
- **Amber Accent** (#f59e0b): Used sparingly for secondary callouts, warnings, or alternative badges that need to stand out without competing with the primary lime.

### Neutral
- **Deep Navy / Black** (#0a0f0d): Used for the navbar, hero text on light backgrounds, and high-contrast footers.
- **Background White** (#ffffff): The clean canvas for main content areas.
- **Body Text** (#3f4a38): A very dark, slightly green-tinted gray to soften the harshness of pure black while reading paragraphs.

### Named Rules
**The Electric Scarcity Rule.** Electric Lime (#a3d900) must command the eye. Do not use it as a background for large sections; reserve it for buttons, active states, badges, and glowing hovers.

## 3. Typography

**Display Font:** Inter (with Noto Sans Thai)
**Body Font:** Inter (with Noto Sans Thai)

**Character:** A highly legible, modern geometric sans-serif that feels clean and precise, capable of both heavy, shouting headlines and readable body copy.

### Hierarchy
- **Display** (900, 3.2rem, 1.15): Used strictly for Hero section main titles. Tightly tracked (-0.5px) for impact.
- **Headline** (800, 2rem, 1.3): Used for section titles. Confident and heavy.
- **Body** (400, 0.92rem, 1.7): Used for standard paragraph text. Comfortable line-height for readability.
- **Label** (700, 0.68rem, uppercase): Used for section eyebrows and small tags. Wide tracking (2.5px) to offset the small size.

### Named Rules
**The Tightly Packed Headline Rule.** Large display and headline typography must maintain tight line-heights (1.15 to 1.3) and negative letter-spacing to feel designed and cohesive, not scattered.

## 4. Elevation

The system uses a "Lifted & Luminous" philosophy. Cards and elements rest on the surface but lift gracefully with glowing shadows upon interaction.

### Shadow Vocabulary
- **Ambient Card Shadow** (`0 1px 3px rgba(0, 0, 0, 0.04)`): The resting state for cards on a white background. Barely there.
- **Luminous Hover Glow** (`0 4px 20px rgba(163, 217, 0, 0.2)`): The signature electric glow when hovering over primary buttons or premium feature cards.

### Named Rules
**The Active Glow Rule.** Shadows are not just for depth; they represent energy. Interactive elements use the lime green shadow (`--shadow-blue`) to indicate they are "powered on" when hovered.

## 5. Components

### Buttons
- **Shape:** Pill-shaped (100px radius).
- **Primary:** Linear gradient background (`var(--primary)` to `var(--primary-hover)`), navy text, and an inner light stroke.
- **Hover / Focus:** Lifts up (`translateY(-2px)`) and emits a pronounced lime shadow (`0 8px 25px rgba(163, 217, 0, 0.35)`). Text turns white on hover as the gradient darkens.
- **Secondary (Outline):** Transparent background with a 1.5px solid lime border. Fills with gradient on hover.

### Cards / Containers
- **Corner Style:** 12px to 18px radius depending on size.
- **Background:** Solid white (`#fff`) or light off-white (`#f9fbf5`).
- **Shadow Strategy:** Very subtle ambient shadow at rest, lifting on hover.
- **Internal Padding:** Comfortable, generally around 1.4rem to 1.8rem.

### Section Labels (Eyebrows)
- **Style:** Small (0.68rem), heavily tracked (2.5px), uppercase, in primary lime color.
- **State:** Placed above section titles to establish rhythm and context.

## 6. Do's and Don'ts

### Do:
- **Do** use the pill-shaped (100px) buttons with gradients and glowing shadows for primary actions.
- **Do** rely on the stark contrast between Navy (#0a0f0d) and White (#ffffff) for layout structure.
- **Do** use tight line-heights (1.15) for large headings to maintain a solid typographic block.

### Don't:
- **Don't** use standard "AI-generated" cream or sand backgrounds. Keep the canvas clean white or crisp light gray.
- **Don't** create cluttered, busy interfaces. Keep the layout open and information architecture clear.
- **Don't** use generic flat shadows for interactive elements; buttons must use the luminous glowing shadow on hover.
