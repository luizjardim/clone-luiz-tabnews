import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import jest from "eslint-plugin-jest";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    files: ["**/*.test.js", "**/*.test.jsx"],
    plugins: { jest },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
