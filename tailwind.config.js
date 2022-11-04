const colors = require("tailwindcss/colors");

const brandColors = {
  DEFAULT: "#808799",
  50: "#EA8ECF",
  100: "#E77CC8",
  200: "#E05ABA",
  300: "#DA38AB",
  400: "#888D9B",
  500: "#A21E7C",
  600: "#731558",
  700: "#430C34",
  800: "#14040F",
  900: "#000000",
};

const grays = {
  100: "#F2F2F7",
  200: "#E5E5EA",
  300: "#D1D1D6",
  350: "#C7C7CC",
  400: "#AEAEB2",
  500: "#8E8E93",
};

const custom = {
  container: "#EDEEEF", // white
  action: "#FFFFFF",
  container: {
    DEFAULT: "#EDEEEF",
  }, // black
};

const textColor = {
  DEFAULT: "#000000",
  default: "#000000",
  secondary: grays[400],
};

module.exports = {
  content: ["./src/**/*.{html,ts,tsx}"],
  mode: "jit",
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1220px",
    },
    extend: {
      fontSize: {
        xs: "0.8125rem",
      },
      colors: {
        ...colors,
        ...custom,
        brand: brandColors,
        gray: grays,
        primary: brandColors,
      },
      textColor,
      scale: {
        98: ".98",
        102: "1.02",
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
