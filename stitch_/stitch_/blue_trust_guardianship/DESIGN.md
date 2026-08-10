---
name: Blue Trust Guardianship
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#434654'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#285ea5'
  on-secondary: '#ffffff'
  secondary-container: '#82b2fe'
  on-secondary-container: '#004384'
  tertiary: '#444a52'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c626a'
  on-tertiary-container: '#d9dee7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a8c8ff'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#00468a'
  tertiary-fixed: '#dee3ed'
  tertiary-fixed-dim: '#c1c7d0'
  on-tertiary-fixed: '#161c23'
  on-tertiary-fixed-variant: '#41474f'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The brand personality centers on **Professional Reliability** and **Calm Guardianship**. It is designed for users who require a sense of security, stability, and intelligence in their interactions. The UI should evoke a feeling of "competent protection"—where the system is always in control and highly dependable.

The design style is **Corporate Modern with a Soft Edge**. It leverages the structural clarity of high-end enterprise software but softens the rigid edges with approachable typography and gentle roundedness. It prioritizes clarity over ornamentation, using purposeful whitespace and a structured color hierarchy to guide the user through complex information with ease.

## Colors
The color palette is anchored by **Trust-Inspiring Blue**, replacing all previous warm or brown tones with a cohesive, professional cooling spectrum.

- **Primary (#1A56DB):** A deep, saturated blue used for primary actions and brand presence. It signals authority and stability.
- **Secondary (#7CACF8):** A softer, mid-tone blue for supporting elements and active states.
- **Surface/Tertiary (#F0F5FF):** A very pale blue tint used for background sections and containers, replacing warm beige to maintain a cool, clean environment.
- **Neutral (#1F2937):** A deep slate gray for high-contrast typography and borders, ensuring better legibility than pure black.

Success, Warning, and Error states should be integrated using a matching blue-toned saturation level to maintain visual harmony.

## Typography
This design system utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary, optimistic, and approachable feel. 

- **Headlines:** Use Bold (700) and Semi-Bold (600) weights with slight negative letter spacing on larger sizes to create a "locked-in," authoritative look.
- **Body:** Use Regular (400) weight for maximum readability. Line heights are generous (1.5x) to prevent cognitive fatigue during long reading sessions.
- **Labels:** Use Semi-Bold (600) with slight tracking to differentiate metadata and small UI controls from body text.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid Grid**. Content is housed in a centered container with a maximum width of 1280px on desktop, while margins and gutters remain fluid on smaller breakpoints.

- **Grid:** 12-column layout for desktop (24px gutter), 8-column for tablet, and 4-column for mobile.
- **Spacing Rhythm:** Based on an 8px scale. All component internal padding and external margins should be multiples of 8px to ensure mathematical harmony and visual alignment.
- **Vertical Rhythm:** Use larger gaps (48px+) between distinct sections to reinforce the "Guardianship" philosophy of providing clear, breathable information.

## Elevation & Depth
The design system employs **Tonal Layering** supplemented by **Ambient Shadows** to define hierarchy.

- **Base Layer:** The lowest surface uses the tertiary color (#F0F5FF) or white.
- **Surface Containers:** Cards and modals use a white background to "pop" against the cool blue-tinted base layer.
- **Shadows:** Use extra-diffused shadows with a hint of the primary blue in the shadow color (e.g., `rgba(26, 86, 219, 0.08)`) rather than pure black. This prevents the UI from looking "dirty" and maintains the professional color story.
- **Borders:** Use low-contrast blue-gray outlines (1px) for inactive states or secondary containers.

## Shapes
The shape language is consistently **Rounded**, using an 8px (0.5rem) base radius. This specific radius provides a balance between the precision of a sharp corner and the friendliness of a full circle.

- **Standard Components:** Buttons, Inputs, and Small Cards use the base 8px radius.
- **Large Components:** Modals and primary section containers use `rounded-lg` (16px) to emphasize their role as "encompassing" containers.
- **Interactive States:** On hover, shapes should not change radius, but rather increase depth through shadow or stroke weight.

## Components
- **Buttons:** Primary buttons use the Trust Blue background with white text. Secondary buttons use a primary blue outline with the tertiary blue background.
- **Input Fields:** Use 8px rounded corners with a 1px slate-blue border. On focus, the border thickens and changes to the primary blue with a soft outer glow.
- **Cards:** White background, 8px radius, and a soft ambient blue shadow. They should feel like elevated "islands" of information.
- **Chips/Badges:** Small, 8px rounded elements using the tertiary blue background and primary blue text for a "tone-on-tone" professional look.
- **Lists:** Use subtle horizontal dividers in a very light blue-gray. Interactive list items should have a light blue wash on hover.
- **Status Indicators:** Use blue-tinted variations of green (Success), yellow (Warning), and red (Error) to ensure they feel part of the "Blue Trust" ecosystem.