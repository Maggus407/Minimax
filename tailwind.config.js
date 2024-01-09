module.exports = {
  darkMode: "class",
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      light_bg: '#f3f6fc',
      white: '#ffffff',
      ctTable: '#E5EAF7',
      dark_bg: '#131314',
      dark_blue: '#222224',
      glassy_blue: '#ccd8f0',
      silver: '#c0c0c0',
      orange: '#fa842b',
      dark_text: '#1b1c1d',
      click: '#9fa3a8'
    },
    screens: {	
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      },
    fontFamily: {
      roboto: ['Roboto', 'sans-serif'],
    },
    
    extend: {},
  },
  plugins: [],
}


