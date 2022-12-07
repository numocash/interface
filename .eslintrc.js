"use strict";

require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@saberhq/eslint-config-react"],
  parserOptions: {
    project: "tsconfig.json",
  },
  ignorePatterns: ["*.js", "src/generated/*"],
  rules: {
    "react/no-unknown-property": ["error", { ignore: ["tw", "css"] }],
  },
};
