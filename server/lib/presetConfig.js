/**
 * presetConfig.js
 * 15 reference presets — curated combinations of palette + typography + accent.
 * Users can quick-click a preset, then override individual palette/font/accent.
 */

const PRESETS = {
  notion: {
    id: 'notion',
    name: 'Notion',
    vibe: 'Clean, minimal',
    paletteId: 'chalk',
    typographyId: 'humanist',
    accent: '#666666',
    isDark: false,
  },

  medium: {
    id: 'medium',
    name: 'Medium',
    vibe: 'Editorial, accessible',
    paletteId: 'ivory',
    typographyId: 'editorial',
    accent: '#000000',
    isDark: false,
  },

  linear: {
    id: 'linear',
    name: 'Linear',
    vibe: 'Startup, bold',
    paletteId: 'slate',
    typographyId: 'geometric',
    accent: '#7C3AED',
    isDark: true,
  },

  github: {
    id: 'github',
    name: 'GitHub',
    vibe: 'Technical docs',
    paletteId: 'frost',
    typographyId: 'technical',
    accent: '#0969DA',
    isDark: false,
  },

  stripe: {
    id: 'stripe',
    name: 'Stripe',
    vibe: 'Professional, trustworthy',
    paletteId: 'paper',
    typographyId: 'technical',
    accent: '#5469D4',
    isDark: false,
  },

  substack: {
    id: 'substack',
    name: 'Substack',
    vibe: 'Newsletter, warm',
    paletteId: 'sand',
    typographyId: 'modern_serif',
    accent: '#FF6A00',
    isDark: false,
  },

  ia_writer: {
    id: 'ia_writer',
    name: 'iA Writer',
    vibe: 'Writing-focused, calm',
    paletteId: 'paper',
    typographyId: 'humanist',
    accent: '#4A90E2',
    isDark: false,
  },

  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    vibe: 'Knowledge base, dark',
    paletteId: 'ink',
    typographyId: 'technical',
    accent: '#7C3AED',
    isDark: true,
  },

  latex: {
    id: 'latex',
    name: 'LaTeX',
    vibe: 'Academic, scholarly',
    paletteId: 'paper',
    typographyId: 'academic',
    accent: '#000000',
    isDark: false,
  },

  hbr: {
    id: 'hbr',
    name: 'HBR',
    vibe: 'Premium editorial',
    paletteId: 'ivory',
    typographyId: 'editorial',
    accent: '#CC0000',
    isDark: false,
  },

  dropbox_paper: {
    id: 'dropbox_paper',
    name: 'Dropbox Paper',
    vibe: 'Collaborative, simple',
    paletteId: 'paper',
    typographyId: 'classic',
    accent: '#0061FF',
    isDark: false,
  },

  ghost: {
    id: 'ghost',
    name: 'Ghost',
    vibe: 'Blog platform, elegant',
    paletteId: 'paper',
    typographyId: 'classic',
    accent: '#15171A',
    isDark: false,
  },

  vercel: {
    id: 'vercel',
    name: 'Vercel',
    vibe: 'Ultra-modern, sleek',
    paletteId: 'ink',
    typographyId: 'geometric',
    accent: '#FFFFFF',
    isDark: true,
  },

  framer: {
    id: 'framer',
    name: 'Framer',
    vibe: 'Design tool, bold',
    paletteId: 'chalk',
    typographyId: 'expressive',
    accent: '#A78BFA',
    isDark: false,
  },

  figma_docs: {
    id: 'figma_docs',
    name: 'Figma Docs',
    vibe: 'Design system reference',
    paletteId: 'frost',
    typographyId: 'geometric',
    accent: '#000000',
    isDark: false,
  },
};

module.exports = PRESETS;
