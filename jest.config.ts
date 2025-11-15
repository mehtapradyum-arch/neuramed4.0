import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: { "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["@babel/preset-typescript", "@babel/preset-react"] }] },
};
export default config;
