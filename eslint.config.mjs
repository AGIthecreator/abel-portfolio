import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
...nextVitals,
...nextTs,
{
rules: {
// In this project we intentionally set state in useEffect for client-only
// visualizations (e.g., hydration-safe random particle fields).
"react-hooks/set-state-in-effect": "off",
},
},
// Override default ignores of eslint-config-next.
globalIgnores([
// Default ignores of eslint-config-next:
".next/",
"out/",
"build/**",
"next-env.d.ts",
]),
]);

export default eslintConfig;
