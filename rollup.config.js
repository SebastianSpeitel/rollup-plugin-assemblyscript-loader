import ts from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import assets from "@sebastianspeitel/rollup-plugin-assets";
import { builtinModules } from "module";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    { format: "cjs", file: pkg.main, exports: "auto" },
    { format: "esm", file: pkg.module }
  ],
  plugins: [assets({ encoding: "utf8" }), commonjs(), ts({ sourceMap: false })],
  external: [
    ...builtinModules,
    ...Object.keys(pkg.dependencies),
    "assemblyscript/cli/asc"
  ]
};
