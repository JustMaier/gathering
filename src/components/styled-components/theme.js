import { lighten, darken, rgba } from 'polished'

export const theme = {
  colors: {
    bg: '#333',
    primary: '#5c50ca',
    primaryDark: darken(0.05, '#5c50ca'),
    primaryLight: lighten(0.05, '#5c50ca'),
    secondary: '#fc5090',
    success: '#2ecc71',
    danger: '#e74c3c',

    text: '#fff',
    muted: rgba('#fff', 0.7),
    textShadow: rgba('#000', 0.3),
    header: '#5c50ca'
  },
  sizes: {
    gutter: '20px',
    container: '400px',
    breakpoint: '440px'
  },
  space: [
    0, 5, 10, 15, 20, 30, 60
  ],
  fontSizes: [
    10, 14, 16, 20, 24, 36, 48
  ],
  radii: {
    'right': '0 5px 5px 0',
    'left': '5px 0 0 5px',
    'bottom': '0 0 5px 5px',
    'top': '5px 5px 0 0'
  },
  shadows: {
    lg: '0px 3px 10px rgba(0,0,0,.3)',
    sm: '0px 2px 5px rgba(0,0,0,.3)'
  },
  borders: {
    faint: '1px solid rgba(255,255,255, .1)'
  }
}

theme.list = {
  hover: lighten(0.05, theme.colors.bg),
  border: lighten(0.1, theme.colors.bg),
  bg: rgba(lighten(0.02, theme.colors.bg), 0.8)
}
