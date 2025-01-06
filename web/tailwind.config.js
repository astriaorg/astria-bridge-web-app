/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        astria: {
          white: '#f5f5f5',
          whitest: '#fff',
          'grey-dark': '#333',
          'grey-light': 'hsl(0, 0%, 60%)',
          'grey-lighter': 'hsl(0, 0%, 80%)',
          black: 'hsl(203deg 45% 4%)',
          red: '#BB3631',
          orange: '#df5822',
          'orange-soft': '#f09226',
          green: '#3B7D4F',
          'blue-light': '#74A4BF',
          yellow: '#E0B74A',
        },
        status: {
          success: '#3B7D4F',
          info: '#74A4BF',
          warning: '#E0B74A',
          danger: '#BB3631',
        },
        error: {
          lighter: '#f8d7da',
          light: '#f5c6cb',
          dark: '#721c24',
        }
      },
      backgroundImage: {
        'astria-gradient': 'linear-gradient(to right, #f09226, #df5822)',
        'radial-dark': 'radial-gradient(144.23% 141.13% at 50.15% 0%, #221F1F 0%, #050A0D 100%)',
      },
      textColor: {
        'light': '#f5f5f5',  // $astria-text-light
        'dark': '#333',      // $astria-text-dark
      },
      backgroundColor: {
        'body': 'hsl(203deg 45% 4%)',  // $body-background-color
      },
      borderImage: {
        'astria-gradient': 'linear-gradient(to right, #f09226, #df5822) 1',
      }
    }
  },
  plugins: [],
}