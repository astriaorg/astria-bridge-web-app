module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
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
        },
        textColor: {
          'light': '#f5f5f5',
          'light-gray': '#999',
          'dark': '#333',      
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'lightUpOrange': {
          '0%, 100%': {
            opacity: '0.2',
            boxShadow: 'none',
            borderColor: '#f5f5f5'
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 10px #df5822, 0 0 20px #f09226',
            borderColor: '#f09226'
          }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'light-up-orange': 'lightUpOrange 1s ease-in-out infinite'
      },
      backgroundImage: {
        'astria-gradient': 'linear-gradient(to right, #f09226, #df5822)',
        'radial-dark': 'radial-gradient(144.23% 141.13% at 50.15% 0%, #221F1F 0%, #050A0D 100%)',
        'button-gradient': 'linear-gradient(to right, #f09226, #df5822)',
        'gradient-radial': 'radial-gradient(144.23% 141.13% at 50.15% 0%, var(--tw-gradient-stops))',
      },
      minHeight: {
        'screen-navbar-footer': 'calc(100vh - 85px - 96px)',
      },
      backgroundColor: {
        'body': 'hsl(203deg 45% 4%)',
      },
      borderImage: {
        'astria-gradient': 'linear-gradient(to right, #f09226, #df5822) 1',
      },
      borderColor: {
        'dark': '#333',
      },
    }
  },
  plugins: [],
}