/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft pastels inspired by the dashboard design
        pastel: {
          blue: {
            50: '#EBF5FF',
            100: '#D4EDFF',
            200: '#B8E1FF',
            300: '#A5D8FF',
            light: '#D4EDFF',
            DEFAULT: '#A5D8FF',
          },
          purple: {
            50: '#F3F0FF',
            100: '#E5DEFF',
            200: '#D4C5FF',
            300: '#C3B1FF',
            light: '#E5DEFF',
            DEFAULT: '#C3B1FF',
          },
          pink: {
            50: '#FFF0F8',
            100: '#FFE0F0',
            200: '#FFCCE5',
            300: '#FFB8DB',
            light: '#FFE0F0',
            DEFAULT: '#FFB8DB',
          },
          yellow: {
            50: '#FFFEF0',
            100: '#FFF9D6',
            200: '#FFF3B8',
            300: '#FFED9A',
            light: '#FFF9D6',
            DEFAULT: '#FFED9A',
          },
          green: {
            50: '#EEFFF4',
            100: '#D4FFE3',
            200: '#B5F5D1',
            300: '#9AE6C0',
            light: '#D4FFE3',
            DEFAULT: '#9AE6C0',
          },
          orange: {
            50: '#FFF4E6',
            100: '#FFE8CC',
            200: '#FFD6A5',
            300: '#FFC078',
            light: '#FFE8CC',
            DEFAULT: '#FFC078',
          },
          coral: {
            50: '#FFF0F0',
            100: '#FFD9D9',
            200: '#FFBBBB',
            300: '#FF9999',
            light: '#FFD9D9',
            DEFAULT: '#FF9999',
          },
        },
        // Accent colors
        accent: {
          blue: '#4D96FF',
          purple: '#8B5CF6',
          pink: '#FF69B4',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        'glass-xl': '0 20px 50px 0 rgba(31, 38, 135, 0.30)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
}
