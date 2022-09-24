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
  ...colors.gray,
  100: "#F4F3F5",
  200: "#DDDDDD",
  300: "#CED3DD",
  350: "#A8A8A8",
  400: "#888D9B",
  500: "#6c687d",
  600: "#303236",
  700: "#2B2B2B",
  750: "#1E1E23",
  800: "#121218",
  900: "#111214",
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
