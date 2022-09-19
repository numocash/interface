const fs = require("fs");
const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const webpack = require("webpack");

const srcDirs = fs.readdirSync(path.resolve(__dirname, "./src"), {
  withFileTypes: true,
});

const aliases = srcDirs
  .filter((dir) => dir.isDirectory())
  .reduce(
    (acc, el) => ({
      ...acc,
      [el.name]: path.resolve(__dirname, `./src/${el.name}`),
    }),
    {}
  );

module.exports = {
  babel: {
    presets: [
      [
        "@babel/preset-react",
        { runtime: "automatic", importSource: "@emotion/react" },
      ],
    ],
    plugins: [
      "@emotion/babel-plugin",
      "babel-plugin-twin",
      "babel-plugin-macros",
      [
        "@simbathesailor/babel-plugin-use-what-changed",
        {
          active: process.env.NODE_ENV === "development", // boolean
        },
      ],
    ],
  },
  webpack: {
    alias: aliases,
    configure: (config) => {
      const htmlWebpackPlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === "HtmlWebpackPlugin"
      );
      if (!htmlWebpackPlugin) {
        throw new Error("Can't find HtmlWebpackPlugin");
      }

      config.ignoreWarnings = [/Failed to parse source map/];

      config.resolve.fallback = {
        util: false,
      };

      config.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });

      // pushing here ensures that the dotenv is loaded
      if (process.env.ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({ analyzerMode: "server" })
        );
      }

      return config;
    },
  },
  eslint: {
    enable: false,
  },
  typescript: { enableTypeChecking: false },
};
