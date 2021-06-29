import { SemVerNumber } from './primitives';
export type Target = SemVerNumber | 'esnext' | 'custom';
export type Module = 'esnext' | 'module' | 'commonjs';

export interface Entry {
  script: string;
  argv?: string;
  runAfterDevBuild?: boolean;
  runAfterBuild?: boolean;
}

export interface BuilderOptions {
  bundle: boolean;
  updateBeforeCompile?: boolean;
  cleanBeforeCompile?: boolean;
}

export interface Config {
  target: Target;
  module: Module;
  builder?: BuilderOptions;
  entries: Entry[];
}
