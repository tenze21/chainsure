import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
}, {
  rules: {
    "no-console": "warn",
    "antfu/no-top-level-await": ["off"],
    "node/prefer-global/process": "off",
    "node/no-process-env": "error",
    "jsonc/sort-keys": "off",
    "unicorn/filename-case": ["error", {
      case: "kebabCase", // enforce kebab-case filenames
      ignore: ["README.md"], // except README
    }],
  },
});
