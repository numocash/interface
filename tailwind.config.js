const colors = require("tailwindcss/colors");

const brandColors = {
  DEFAULT: "#A21E7C",
  50: "#EA8ECF",
  100: "#E77CC8",
  200: "#E05ABA",
  300: "#DA38AB",
  400: "#C42496",
  500: "#A21E7C",
  600: "#731558",
  700: "#430C34",
  800: "#14040F",
  900: "#000000",
};

const grays = {
  ...colors.gray,
  100: "#F4F3F5",
  200: "#D9DCE4",
  300: "#CED3DD",
  400: "#a6a9B0",
  600: "#6c687d",
  700: "#514C5F",
  800: "#46494E",
  900: "#070011",
};

const custom = {
  container: "", // white
  action: "#F7F8FA",
  outline: "#CED0D9",
  container: {
    DEFAULT: "#FFFFFF",
    d: "#FFFFFF", //0f141a
  }, // black
  "action-d": "#F7F8FA",
  "outline-d": "#CED0D9",
};

const textColor = {
  DEFAULT: "#000000",
  default: "#000000",
  secondary: grays[400],
  "default-d": "#000000",
  secondary: "#888D9B",
  "secondary-d": "#C3C5CB",
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
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      fontSize: {
        xs: "0.8125rem",
        xxs: ".6rem",
        "3xl": "1.75rem",
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
      typography: {
        DEFAULT: {
          css: {
            p: {
              fontSize: "0.875rem",
              fontWeight: "400",
              lineHeight: "1.0625rem",
              color: textColor.secondary,
            },
            h1: {
              fontSize: "1.25rem",
              fontWeight: "600",
            },
            h2: {
              fontSize: "1.25rem",
              fontWeight: "600",
            },
            h3: {
              fontSize: "0.8125rem",
              fontWeight: "400",
              color: textColor.secondary,
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    // require("@tailwindcss/typography"),
  ],
};
