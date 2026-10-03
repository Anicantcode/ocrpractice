/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        morde: {
          red: "#E4022D",         // Official Morde Signature Red
          redDark: "#C40226",
          redLight: "#FFF0F2",
          cocoa: "#1B0B07",       // Deep Dark Chocolate
          cocoaLight: "#2D160E",  // Milk / Dark Chocolate Accent
          cocoaCard: "#24110A",
          cocoaBorder: "#3D2015",
          cream: "#FDFBF7",       // Official Morde Cream Background
          creamCard: "#FFFFFF",
          creamMuted: "#F5EFE6",
          creamBorder: "#E8DEC9",
          gold: "#EACB85",        // Official Morde Accent Gold rgb(234,203,133)
          goldDark: "#C29B49",
          goldLight: "#FAF3E3",
          silk: "#7D5843",        // Cocoa Milk Text / Secondary
        },
        sap: {
          blue: "#0a6ed1",
          dark: "#1B0B07",
          gold: "#EACB85",
          light: "#FDFBF7",
          border: "#E8DEC9",
          sidebar: "#24110A",
        }
      }
    },
  },
  plugins: [],
}
