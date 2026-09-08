/**
 * Dangerous Dave v2 - UI Design System Tokens
 * Centralized theme constants for colors, typography, layout radii, and micro-interactions.
 */

export const UI_THEME = {
  colors: {
    // Primary Interactive Accent (Teal / Cyan)
    accent: 0x00e5ff,
    accentHex: '#00e5ff',
    accentHover: 0x38bdf8,
    accentHoverHex: '#38bdf8',
    accentGlow: 'rgba(0, 229, 255, 0.4)',
    accentDark: 0x064e62,
    goldTitle: '#ffe066',

    // Text Contrast Scale (WCAG AA compliant against #16232E)
    textHeading: '#e8f4f8',      // Near-white headings & active labels
    textBody: '#9fb8c8',         // Light gray-blue body, values & descriptions
    textHighlight: '#67e8f9',    // High-contrast cyan highlights
    textAlert: '#ff6b81',        // Soft bright red for lives/alerts

    // Primary Button
    primaryBg: 0x0e384c,
    primaryBgHover: 0x154e6a,
    primaryBorder: 0x00e5ff,
    primaryBorderHover: 0x67e8f9,
    primaryText: '#ffffff',
    primaryTextHover: '#e0f7fa',

    // Secondary Surfaces
    secondaryBg: 0x16232e,
    secondaryBgHover: 0x1e3344,
    secondaryBorder: 0x2e4458,
    secondaryBorderHover: 0x00e5ff,
    secondaryText: '#e8f4f8',
    secondaryTextHover: '#ffffff',
    secondaryTextMuted: '#9fb8c8',

    // Cards & Panels (Visibly distinct #16232E vs page #0D1420)
    pageBg: 0x0d1420,
    panelBg: 0x16232e,
    panelAlpha: 0.94,
    panelBorder: 0x2a3e52,
    panelBorderCyan: 0x00e5ff,

    // Stage / Pedestal
    pedestalTop: 0x00e5ff,
    pedestalBody: 0x16232e,
    pedestalRim: 0x2e4458,
    spotlightGlow: 0x00e5ff,

    // Atmospheric / Frame
    frameBorder: 0x00e5ff,
    frameBorderAlpha: 0.16,
    vignetteBg: 0x0d1420,
  },

  fonts: {
    // Retro pixel display font for logo / title only
    display: '"Courier New", Courier, monospace',
    // One unified crisp UI font for buttons, body, labels, badges
    ui: '"Courier New", Courier, monospace',
  },

  radii: {
    buttonPrimary: 10,
    buttonSecondary: 8,
    buttonIcon: 6,
    card: 12,
  },

  transitions: {
    hoverScale: 1.03,
    pressScale: 0.96,
    durationMs: 180,
  },
} as const;
