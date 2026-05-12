/**
 * paletteConfig.js
 * 8 color palettes with all design tokens for document backgrounds, text, borders, tables.
 * Each palette is used by multiple presets and can be overridden independently.
 */

const PALETTES = {
  paper: {
    id: 'paper',
    name: 'Paper',
    bg: '#FFFFFF',
    bodyText: '#1A1A1A',
    surface: '#F9F9F9',
    surface2: '#F3F3F3',
    border: '#E0E0E0',
    border2: '#D5D5D5',
    tableRow: '#F7F7F7',
  },

  ivory: {
    id: 'ivory',
    name: 'Ivory',
    bg: '#FBF8F3',
    bodyText: '#2C2016',
    surface: '#F5EFE6',
    surface2: '#EEE7DC',
    border: '#E5D9CC',
    border2: '#D9CCBC',
    tableRow: '#F9F5F0',
  },

  sand: {
    id: 'sand',
    name: 'Sand',
    bg: '#FDF6EC',
    bodyText: '#2A1E10',
    surface: '#F7EFE2',
    surface2: '#F1E7D8',
    border: '#E8DBC8',
    border2: '#DCCDB8',
    tableRow: '#FBFAF7',
  },

  frost: {
    id: 'frost',
    name: 'Frost',
    bg: '#F5F7FA',
    bodyText: '#1A2030',
    surface: '#EEF1F7',
    surface2: '#E7ECEF',
    border: '#D9E1EB',
    border2: '#CCD7E5',
    tableRow: '#F9FBFC',
  },

  chalk: {
    id: 'chalk',
    name: 'Chalk',
    bg: '#F8F8F8',
    bodyText: '#1C1C1E',
    surface: '#F2F2F2',
    surface2: '#ECECEC',
    border: '#E0E0E0',
    border2: '#D5D5D5',
    tableRow: '#F6F6F6',
  },

  slate: {
    id: 'slate',
    name: 'Slate',
    bg: '#1E232B',
    bodyText: '#E8EAF0',
    surface: '#2A3139',
    surface2: '#303740',
    border: '#424A55',
    border2: '#555D68',
    tableRow: '#242D38',
  },

  carbon: {
    id: 'carbon',
    name: 'Carbon',
    bg: '#1A1A1A',
    bodyText: '#E8E4DC',
    surface: '#242424',
    surface2: '#2E2E2E',
    border: '#3E3E3E',
    border2: '#4A4A4A',
    tableRow: '#1F1F1F',
  },

  ink: {
    id: 'ink',
    name: 'Ink',
    bg: '#0F1117',
    bodyText: '#EAEAEA',
    surface: '#161B22',
    surface2: '#21262D',
    border: '#30363D',
    border2: '#444C56',
    tableRow: '#13171C',
  },
};

module.exports = PALETTES;
