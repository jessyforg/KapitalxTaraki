/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
        
        'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' },
        'high-dpi': { 'raw': '(-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)' },
        
        'laptop': '1024px',
        'laptop-lg': '1440px',
        'laptop-xl': '1728px',
        
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 2rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 3rem)',
        'fluid-3xl': 'clamp(1.875rem, 6vw, 4rem)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      
      backdropBlur: {
        'high-dpi': '20px',
      },
      
      boxShadow: {
        'high-dpi': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.crisp-text': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        
        '.container-sm': {
          'container-type': 'inline-size',
          'width': '100%',
          'max-width': theme('screens.sm'),
        },
        
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        
        '.border-crisp': {
          'transform': 'translateZ(0)',
        },
        
        '.text-responsive': {
          'font-size': 'clamp(0.875rem, 2.5vw, 1.125rem)',
          'line-height': 'clamp(1.25rem, 3vw, 1.5rem)',
        },
      }
      
      addUtilities(newUtilities)
    },
    
    function({ addBase, addComponents }) {
      addBase({
        '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
          '*': {
            '-webkit-font-smoothing': 'antialiased',
            '-moz-osx-font-smoothing': 'grayscale',
          },
        },
      })
      
      addComponents({
        '.responsive-grid': {
          display: 'grid',
          'grid-template-columns': 'repeat(1, 1fr)',
          gap: theme('spacing.4'),
          
          '@screen sm': {
            'grid-template-columns': 'repeat(2, 1fr)',
            gap: theme('spacing.6'),
          },
          
          '@screen lg': {
            'grid-template-columns': 'repeat(3, 1fr)',
            gap: theme('spacing.8'),
          },
          
          '@screen xl': {
            'grid-template-columns': 'repeat(4, 1fr)',
          },
        },
        
        '.sidebar-responsive': {
          width: '16rem',
          transform: 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          
          '@screen lg': {
            transform: 'translateX(0)',
            position: 'fixed',
          },
          
          '&.open': {
            transform: 'translateX(0)',
          },
        },
      })
    },
  ],
} 