import { pathSlash } from './lib/filesystem';
import * as ProjectSchema from './schema/project';

interface Globals {
  argv: Record<string, unknown>;
  project: ProjectSchema.Project;
}

const globals: Globals = {
  argv: {},
  project: {
    root: pathSlash(process.cwd()).toLowerCase(),
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    target: '',
    module: '',
    addons: {
      webpack: null,
      eslint: null,
      prettier: null
    }
  }
};

export default globals;
