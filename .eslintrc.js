"use strict";

module.exports = {
  extends: ["@saberhq/eslint-config-react"],
  parserOptions: {
    project: "tsconfig.json",
  },
  ignorePatterns: ["*.js", "src/generated/*", "src/gql/*"],
  rules: {
    "react/no-unknown-property": ["error", { ignore: ["tw", "css"] }],
  },
};
