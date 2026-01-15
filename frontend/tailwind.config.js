/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design System - Cores TeamSync (Nova Paleta)
      colors: {
        // Primary Blue → #1F4FFF (confiança, tecnologia, coordenação, "sync")
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#1F4FFF',
          600: '#1E40AF',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#172554',
          DEFAULT: '#1F4FFF',
        },
        // Dark Navy → #0E1424 (profissionalismo, fundo premium, foco)
        navy: {
          50: '#F7F9FC',
          100: '#E5E8EF',
          200: '#CBD1DF',
          300: '#A1A9C0',
          400: '#6B7594',
          500: '#4A5470',
          600: '#3A4258',
          700: '#2D3444',
          800: '#1F2532',
          900: '#0E1424',
          DEFAULT: '#0E1424',
        },
        // Soft White → #F7F9FC (leitura fácil, espaço, calma)
        white: {
          DEFAULT: '#FFFFFF',
          soft: '#F7F9FC',
        },
        // Light Grey → #E5E8EF (divisores, backgrounds suaves)
        grey: {
          50: '#F7F9FC',
          100: '#E5E8EF',
          200: '#CBD1DF',
          300: '#A1A9C0',
          400: '#6B7594',
          500: '#4A5470',
          DEFAULT: '#E5E8EF',
        },
        // Accent Green → #2ED47A (sucesso, confirmação, estados positivos)
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#2ED47A',
          600: '#16A34A',
          700: '#15803D',
          DEFAULT: '#2ED47A',
        },
        // Warning Amber → #FFB020 (alertas)
        warning: {
          DEFAULT: '#FFB020',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFB020',
          600: '#D97706',
        },
        // Neutros (compatibilidade)
        neutral: {
          50: '#F7F9FC',
          100: '#E5E8EF',
          200: '#CBD1DF',
          300: '#A1A9C0',
          400: '#6B7594',
          500: '#4A5470',
          600: '#3A4258',
          700: '#2D3444',
          800: '#1F2532',
          900: '#0E1424',
        },
        // Secondary (compatibilidade)
        secondary: {
          50: '#F7F9FC',
          100: '#E5E8EF',
          200: '#CBD1DF',
          300: '#A1A9C0',
          400: '#6B7594',
          500: '#4A5470',
          600: '#3A4258',
          700: '#2D3444',
          800: '#1F2532',
          900: '#0E1424',
        },
        // Error (mantido para compatibilidade)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Danger (alias para error)
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      // Design System - Tipografia TeamSync
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
      },
      // Design System - Espaçamentos
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Design System - Bordas (arredondadas, estilo moderno)
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      // Design System - Sombras
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}

