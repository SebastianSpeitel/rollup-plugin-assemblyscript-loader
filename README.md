# @sebastianspeitel/rollup-plugin-assemblyscript-loader

🍣 A Rollup plugin to import, compile and load assemblyscript using @assemblyscript/loader

## Install

Using npm:

```console
npm install @sebastianspeitel/rollup-plugin-assemblyscript-loader --save-dev
```

## Usage

To compile and import an assemblyscript module import the entry file of the module.

```ts
import {} from "assemblyscript:./assembly/main.ts";
```

### Exports

The imported module exports the following values:

#### wasmUrl

The relative URL to the .wasm file.

```ts
import { wasmUrl } from "assemblyscript:./assembly/main.ts";
```

#### modulePromise

A Promise resolving with with the compiled `Webassembly.Module`.

```ts
import { modulePromise } from "assemblyscript:./assembly/main.ts";
```

#### instancePromise

A Promise resolving with a `WebAssembly.Instance`.

```ts
import { instancePromise } from "assemblyscript:./assembly/main.ts";
```

#### instantiate

A function to start compiling and instantiating with a given import object resolving with a `WebAssembly.Instance`.

```ts
import { instantiate } from "assemblyscript:./assembly/main.ts";

const instance = await instantiate({ log: console.log });
```

## Options

### `compilerOptions`

Type: `CompilerOptions`<br>
Default: `{}`

CompilerOptions passed to asc to compile the assemblyscript module.

### `emitText`

Type: `bool`<br>
Default: `true`

Whether to emit the `.wat` file of the compiled module.

### `exclude`

Type: `RegExp | string | string[]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `RegExp | string | string[]`<br>
Default: `/^assemblyscript:.*/`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all files prefixed with `assemblyscript:` are targeted.
