/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode support
  theme: {
    extend: {
      // Enhanced breakpoints for better responsive control
      screens: {
        'xs': '475px',      // Extra small devices
        'sm': '640px',      // Small devices (default)
        'md': '768px',      // Medium devices (default)
        'lg': '1024px',     // Large devices (default)
        'xl': '1280px',     // Extra large devices (default)
        '2xl': '1536px',    // 2X large devices (default)
        '3xl': '1920px',    // Ultra wide screens
        '4xl': '2560px',    // Very large displays
        
        // High-DPI specific breakpoints
        'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' },
        'high-dpi': { 'raw': '(-webkit-min-device-pixel-ratio: 3), (min-resolution: 288dpi)' },
        
        // Laptop-specific breakpoints (for devices like yours)
        'laptop': '1024px',
        'laptop-lg': '1440px',
        'laptop-xl': '1728px', // For scaled 2880px displays
        
        // Portrait vs landscape
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        
        // Touch device specific
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
      
      // Enhanced font sizes for better responsive typography
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
        
        // Fluid typography sizes
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 2rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 3rem)',
        'fluid-3xl': 'clamp(1.875rem, 6vw, 4rem)',
      },
      
      // Enhanced spacing for responsive layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Container improvements
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
      
      // Enhanced colors for your orange theme
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Your primary orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      
      // High-DPI optimizations
      backdropBlur: {
        'high-dpi': '20px',
      },
      
      // Enhanced shadows for high-DPI
      boxShadow: {
        'high-dpi': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    // Add responsive typography plugin
    require('@tailwindcss/typography'),
    
    // Custom plugin for responsive utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // High-DPI optimizations
        '.crisp-text': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        
        // Responsive container queries (experimental)
        '.container-sm': {
          'container-type': 'inline-size',
          'width': '100%',
          'max-width': theme('screens.sm'),
        },
        
        // Touch-friendly sizing
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        
        // High-DPI border fix
        '.border-crisp': {
          'transform': 'translateZ(0)',
        },
        
        // Responsive text that works well across all devices
        '.text-responsive': {
          'font-size': 'clamp(0.875rem, 2.5vw, 1.125rem)',
          'line-height': 'clamp(1.25rem, 3vw, 1.5rem)',
        },
      }
      
      addUtilities(newUtilities)
    },
    
    // Custom plugin for high-DPI handling
    function({ addBase, addComponents }) {
      addBase({
        // Global high-DPI optimizations
        '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
          '*': {
            '-webkit-font-smoothing': 'antialiased',
            '-moz-osx-font-smoothing': 'grayscale',
          },
        },
      })
      
      addComponents({
        // Responsive grid that works well on all devices
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
        
        // Responsive sidebar component
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

// Usage instructions for your AdminDashboard:
/*
1. Import the responsive hooks:
   import { useBreakpoint, useScreenSize } from '../hooks/useScreenSize';

2. Use in component:
   const { isDesktop, isMobile } = useBreakpoint();
   const screenSize = useScreenSize();

3. Apply responsive classes:
   className={`
     grid responsive-grid
     text-responsive crisp-text
     ${isDesktop ? 'pl-64' : 'pl-0'}
   `}

4. For your high-DPI laptop issue, the key is using CSS pixels (window.innerWidth)
   not physical pixels. The hooks handle this correctly.

5. Test different breakpoints:
   - Mobile: < 768px
   - Tablet: 768px - 1023px  
   - Desktop: >= 1024px
   
6. Your 2880x1800 laptop should be detected as desktop because:
   - CSS pixels (logical): likely 1440px or 1920px 
   - Physical pixels: 2880px (but we ignore this)
   - We use window.innerWidth which gives CSS pixels
*/ 