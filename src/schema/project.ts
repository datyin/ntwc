import * as Primitives from './primitives';

export type Target = '' | 'esnext' | Primitives.SemVerNumber;
export type Module = '' | 'esnext' | 'module' | 'commonjs';

export interface Addons {
  webpack: boolean | null;
  eslint: boolean | null;
  prettier: boolean | null;
}

export interface Project {
  root: string;
  name: string;
  version: Primitives.SemVerNumber;
  description: string;
  author: string;
  target: Target;
  module: Module;
  addons: Addons;
}
