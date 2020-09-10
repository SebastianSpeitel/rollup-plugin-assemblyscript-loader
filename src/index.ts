import { createFilter, FilterPattern } from "@rollup/pluginutils";
import type { Plugin } from "rollup";
import asCompiler from "assemblyscript/cli/asc";
import { basename } from "path";
import { promises as fs } from "fs";
import { source as libSource } from "asset:./static/lib.js";

interface Options {
  include: FilterPattern;
  exclude: FilterPattern;
  emitText: boolean;
  compilerOptions: asCompiler.CompilerOptions;
}
const PREFIX = "assemblyscript:";
const LIB_IMPORT = "__assemblyscript-loader";

const defaultOpts: Options = {
  include: /^assemblyscript:.*/,
  exclude: null,
  emitText: true,
  compilerOptions: {}
};

export default function assets(_opts: Partial<Options> = {}) {
  const opts = { ...defaultOpts, ..._opts };
  const filter = createFilter(opts.include, opts.exclude);

  const plugin: Plugin = {
    name: "Assemblyscript loader",
    async resolveId(id, importer) {
      if (id === LIB_IMPORT) {
        return LIB_IMPORT;
      }

      if (!filter(id)) return null;

      const plainId = id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id;
      const result = await this.resolve(plainId, importer);
      if (!result) {
        this.warn(
          `Coudn't resolve assembly script module ${plainId} (imported by ${importer})`
        );
        return;
      }

      return PREFIX + result.id;
    },
    async load(id) {
      if (id === LIB_IMPORT) return libSource;
      if (!id.startsWith(PREFIX)) return;

      const assetPath = id.slice(PREFIX.length);
      const source = await fs.readFile(assetPath);

      const options = opts.compilerOptions;
      options.binaryFile ??= basename(id, ".ts") + ".wasm";
      options.textFile ??= basename(options.binaryFile, ".wasm") + ".wat";

      const { stderr, stdout, ...files } = asCompiler.compileString(
        source.toString(),
        options
      );

      const errors = (stderr as unknown) as string[];

      if (errors.length) {
        for (let err of errors) this.warn(err);
        return;
      }

      let referenceId: string | undefined;
      for (let name of Object.keys(files) as Array<keyof typeof files>) {
        const source = files[name];
        if (!source) continue;
        if (!opts.emitText && name === options.textFile) continue;

        const refId = this.emitFile({
          type: "asset",
          name,
          source
        });

        if (name === options.binaryFile) {
          referenceId = refId;
        }
      }

      if (!referenceId) {
        this.warn(`No binary output for ${id}`);
        return;
      }

      let code = `export const wasmUrl = import.meta.ROLLUP_FILE_URL_${referenceId};\n`;
      code += `import * as lib from "${LIB_IMPORT}"\n`;
      code += `export const modulePromise = /*@__PURE__*/lib.compile(wasmUrl);\n`;
      code += `export const instancePromise = /*@__PURE__*/lib.instantiate(wasmUrl);\n`;
      code += `export const instantiate = importObject => lib.instantiate(wasmUrl, importObject);\n`;

      return code;
    },
    resolveFileUrl({ moduleId, relativePath, format }) {
      if (!moduleId.startsWith(PREFIX)) return;

      switch (format) {
        case "cjs":
          return `__dirname+${JSON.stringify("/" + relativePath)}`;
        case "es":
          return `new URL(${JSON.stringify(
            relativePath
          )},import.meta.url).pathname`;
      }
    }
  };

  return plugin;
}
