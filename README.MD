# NTWC - NodeJS TypeScript Webpack Compiler

> Generate fully configured [TypeScript](https://www.typescriptlang.org/) project in matter of seconds for your new [NodeJS](https://nodejs.org/en/) application.

## Installation

```bash
npm install -g @tyin/ntwc
```
---

## Features
- Automatic configuration of TypeScript for specific node version
- Automatic configuration of WebPack (Optional)
- Automatic configuration of ESLint (Optional)
- Automatic configuration of Prettier (Optional)
- Automatic configuration for ES Modules after compile
- Automatic generation of package.json with used dependencies only after build
- Support for TSConfig Paths (Yes, after compilation also!)
- Option to bundle your project with WebPack
- Easy development with script watcher & script execution after success compile

---
## Getting Started
### 1. Generating new project
1. Commands & Options:
- `init`, `create`, or `generate` - to generate new project

Option | Shorthand Option | Description | Default | Values
------------ | ------------- | ------------- | ------------- | -------------
`--target` | `-t` | NodeJS version you are targeting | `14.0.0` | `esnext` or `semver valeu`
`--module` | `-m` | Module type of your script | `esmodule` | `esnext`, `module` or `commonjs`
`--name` | `-n` | Project name | `n/a` | `{string}`
`--webpack` / `--no-webpack` | `-wpk` | Enable/Disable WebPack | `false` | `n/a`
`--eslint` / `--no-eslint` | `-esl` | Enable/Disable ESLint | `true` | `n/a`
`--prettier` / `--no-prettier` | `-prt` | Enable/Disable Prettier | `true` | `n/a`

2. Example

The following command will generate project in current directory
```bash
ntwc create
```
Generating project with predefined target and module kind:
```bash
ntwc create -t 12.0.0 -m commonjs
```

### 2. Serving / Building project
#### 2.1 Commands & Options:
- `serve`, `watch` or `dev` - to build and run project in developer mode
- `build` or `compile` - to build and run project in production mode

---
#### 2.2 Example

##### Build Mode
To execute script after successfully file you have to set `runAfterBuild: true` for each script in .ntwcrc.json config.

```json
{
  "entries": [
    {
      "script": 'index',
      "argv": '',
      "runAfterBuild": true
    }
  ]
}
```

##### Watch Mode
Same method as `Build Mode` is used except during serve mode when reading from `.ntwcrc.json` compiler will check for `runAfterDevBuild: true` instead of `runAfterBuild`

```json
{
  "entries": [
    {
      "script": 'index',
      "argv": '',
      "runAfterDevBuild": true
    }
  ]
}
```
---
### 3. Adding New Entry Point
To add new entry point for your application you can use following command
```bash
ntwc add --entry "app"
```
This will:
1. Create `./src/app.ts`
2. Add entry to `./ntwcrc.json`

---
### 4. Changing target
To change NodeJS target version you can use following command
```bash
ntwc change --target 12.0.0 --module commonjs
```

!IMPORTANT:
This command will overwrite following config files:
`.ntwcrc.json`
```javascript
// Values to be overwriten
['target', 'module']
```

`tsconfig.json`
```javascript
// Values to be overwriten
['compilerOptions.target', 'compilerOptions.module', 'compilerOptions.lib']
```

This will:
1. Reconfigure your tsconfig.json (IDE reload might be needed)
3. Reconfigure your .ntwcrc.json

---
## .ntwcrc.json
```json
{
  "target": "esnext" or "14.0.0",
  "module": "module", // esnext, module or commonjs
  "builder": {
    "bundle": false, // bundle code after production compile using webpack
    "updateBeforeCompile": false, // Update Packages before building project for production
    "cleanBeforeCompile": true // Remove /dist/ contents before each compile
  },
  // List of scripts that will be used for compiler to determinate whether script should be executed or not.
  // Also this list will be used if using webpack to point entry points.
  "entries": [
    {
      "script": 'index', // point to script name without extension ./src/{script}.ts
      "argv": '', // Pass arguments to current script. process.argv.
      "runAfterDevBuild": true, // Execute current script after successfull build during serve mode
      "runAfterBuild": false // Execute current script after successfully build for production mode
    }
  ]
}
```

---
## Disabled Config Properties
Some of the original config values will be always overwriten and have no effect if you set them in original config file. Like:

---
> tsconfig.json

| Property                           | Description                                |
| ---------------------------------- |:------------------------------------------ |
| `compilerOptions.moduleResolution` | Always set to `node`                       |
| `include` & `files`                | Those settings can be modified for IDE purposes and has no effect during compilation. Compiler will ignore `include` and generate `files` based on `.ntwcrc.json` entries. This way we wont have to compile unused scripts. |

---
> package.json

| Property        | Description                           |
| --------------- |:------------------------------------- |
| `main`          | Auto generated after build            |
| `type`          | Auto generated after build            |
| `engines.node`  | Auto generated after build (unset value if target is 'esnext') |

---
> webpack.config.js

| Property              | Description                           |
| --------------------- |:------------------------------------- |
| `mode`                | Always set to `production`            |
| `target`              | Based on `.ntwcrc.rc` target          |
| `entry`               | Based on `.ntwcrc.rc` entries         |
| `output.path`         | Always set to `./bundle`              |
| `output.library`      | Based on `.ntwcrc.rc` module          |
| `output.libraryTarget`| Unused because its deprecated         |
| `node.global`         | Always set to `false`                 |
| `node.__filename`     | Always set to `false`                 |
| `node.__dirname`      | Always set to `false`                 |

---
## Q&A
**1.** Why do we need entries in `.ntwcrc.json`? Unlike on Web Server, in NodeJS we are always executing only one script per call. This property will allow compiler to know which script should be compiled, bundled and/or executed without compiling or touching any unused/unmodified script from the source directory.

**2.** Will my code run faster if i bundle it? ***NO***, bundling your code wont make any performance differences to your application. Its just there as an option. Who knows... maybe you wanna be that evil coworker that don't want his code to be edited by others 😈

---
## Special Thanks
- [Linus Unnebäck](https://stackoverflow.com/users/148072/linus-unneb%c3%a4ck) for the typescript configuration research when targeting specific versions of NodeJS
