module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFCB37", // Bumble Yellow
          50: "#FFFBEA",
          100: "#FFF3C4",
          200: "#FFE699",
          300: "#FFD966",
          400: "#FFCB37",
          500: "#E6B000",
          600: "#B38900",
          700: "#806200",
          800: "#4D3B00",
          900: "#1A1400",
        },
        secondary: {
          DEFAULT: "#000000", // Deep Black
          50: "#F2F2F2",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A",
        },
        surface: "#FFFFFF",
        background: "#FAFAFA",
      },
      fontFamily: {
        sans: ['"Outfit"', "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        card: "0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
