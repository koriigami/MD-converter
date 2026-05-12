/**
 * typographyConfig.js
 * 8 typography styles with heading + body font pairs, sizing ratios, and Google Fonts imports.
 * Each style can be applied independently across all presets.
 */

const TYPOGRAPHY = {
  humanist: {
    id: 'humanist',
    name: 'Humanist',
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400',
    h1: '2rem',
    h2: '1.4rem',
    h3: '1.15rem',
    body: '10.5pt',
    lineHeight: '1.6',
  },

  editorial: {
    id: 'editorial',
    name: 'Editorial',
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Source Serif 4', serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400',
    h1: '2.2rem',
    h2: '1.5rem',
    h3: '1.2rem',
    body: '10.5pt',
    lineHeight: '1.7',
  },

  technical: {
    id: 'technical',
    name: 'Technical',
    headingFont: "'IBM Plex Sans', sans-serif",
    bodyFont: "'IBM Plex Sans', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400',
    h1: '1.9rem',
    h2: '1.35rem',
    h3: '1.1rem',
    body: '10.5pt',
    lineHeight: '1.65',
  },

  academic: {
    id: 'academic',
    name: 'Academic',
    headingFont: "'EB Garamond', serif",
    bodyFont: "'EB Garamond', serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'EB+Garamond:ital,wght@0,400;0,500;0,600;1,400',
    h1: '2.4rem',
    h2: '1.6rem',
    h3: '1.3rem',
    body: '11pt',
    lineHeight: '1.75',
  },

  expressive: {
    id: 'expressive',
    name: 'Expressive',
    headingFont: "'Cormorant Garamond', serif",
    bodyFont: "'Lato', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400',
    h1: '2.4rem',
    h2: '1.6rem',
    h3: '1.3rem',
    body: '10.5pt',
    lineHeight: '1.6',
  },

  geometric: {
    id: 'geometric',
    name: 'Geometric',
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'Space+Grotesk:wght@300;400;500;600;700',
    h1: '2rem',
    h2: '1.4rem',
    h3: '1.15rem',
    body: '10.5pt',
    lineHeight: '1.65',
  },

  classic: {
    id: 'classic',
    name: 'Classic',
    headingFont: "'Merriweather', serif",
    bodyFont: "'Merriweather', serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'Merriweather:ital,wght@0,400;0,700;1,400',
    h1: '2.2rem',
    h2: '1.5rem',
    h3: '1.2rem',
    body: '10.8pt',
    lineHeight: '1.75',
  },

  modern_serif: {
    id: 'modern_serif',
    name: 'Modern Serif',
    headingFont: "'DM Serif Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    monoFont: "'JetBrains Mono', monospace",
    gfonts: 'DM+Serif+Display:ital@0,1&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400',
    h1: '2.1rem',
    h2: '1.45rem',
    h3: '1.2rem',
    body: '10.5pt',
    lineHeight: '1.65',
  },
};

module.exports = TYPOGRAPHY;
