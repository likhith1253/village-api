/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0b0b0f', // Dark charcoal
          card: '#121217',    // Card charcoal
          popover: '#181822', // Dropdown/Popover charcoal
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#735bf2', // Muted violet
          600: '#5e45e7', // Slightly darker muted violet
          700: '#4d32d3',
          800: '#3e22be',
          900: '#2f149b',
          950: '#1c0a6b',
        },
        border: {
          DEFAULT: '#1e1e26', // Higher contrast border
          light: '#2d2d3c',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
