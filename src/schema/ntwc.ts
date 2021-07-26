import { SemVerNumber } from './primitives';
export type Target = SemVerNumber | 'esnext' | 'custom';
export type Module = 'esnext' | 'module' | 'commonjs';

export interface Entry {
  script: string;
  argv: string;
  runAfterDevBuild: boolean;
  runAfterBuild: boolean;
  binaryName: string;
  path?: string; // only after load
}

export interface BuilderOptions {
  bundle: boolean;
  updateBeforeCompile: boolean;
  cleanBeforeCompile: boolean;
}

export interface NPMOptions {
  publish: boolean;
  private: boolean;
}

export interface Structure {
  bundle: string;
  distribution: string;
  source: string;
  resources: string[];
}

export interface Config {
  target: Target;
  module: Module;
  structure: Structure;
  builder: BuilderOptions;
  npm: NPMOptions;
  entries: Entry[];
}
