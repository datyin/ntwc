import _ from 'lodash';
import ts from 'typescript';
import { outputFileSync } from 'fs-extra';
import globals from '../global';
import { findModules, IModulesFound, ScriptType } from './modules';
import log from './logger';

import * as TSC from '../schema/tsc';

type SS = Record<string, string>;

const correctPath = (
  content: string,
  imports: IModulesFound[],
  paths: TSC.Paths[],
  pathLevels: number,
  addExtension: boolean
): string => {
  _.forEach(imports, (i) => {
    if (i.type === ScriptType.EXTERNAL_MODULE || i.type === ScriptType.BUILT_IN_MODULE) {
      return;
    }

    if (addExtension && i.type === ScriptType.LOCAL_FILE) {
      // Add extension to local file without extension
      if (!i.path.endsWith('.js')) {
        const correct = i.import.replace(
          `${i.quote}${i.path}${i.quote}`,
          `${i.quote}${i.path}.js${i.quote}`
        );

        content = content.replace(i.import, correct);
      }
    } else {
      // Unknown is probably path alias
      if (i.type === ScriptType.UNKNOWN) {
        _.forEach(paths, (p) => {
          // convert alias path to relative path
          if (i.path.startsWith(p.alias)) {
            const path = `./${_.repeat('../', pathLevels)}${p.path}`;
            let deAlias = i.path.replace(p.alias, path);

            // Missing extension
            if (addExtension && !deAlias.endsWith('.js')) {
              deAlias = `${deAlias}.js`;
            }

            const correct = i.import.replace(
              `${i.quote}${i.path}${i.quote}`,
              `${i.quote}${deAlias}${i.quote}`
            );

            content = content.replace(i.import, correct);
            return false;
          }

          return true;
        });
      }
    }
  });

  return content;
};

const fixImports = (
  options: ts.CompilerOptions,
  paths: TSC.Paths[],
  npmModules: string[],
  files: SS
): void => {
  _.forEach(files, (content, filePath) => {
    const shortPath = filePath.replace(globals.project.root + '/dist/', '');
    const pathLevels = shortPath.split('/').length - 1;

    let contentWithoutComments = content;

    if (!options.removeComments) {
      contentWithoutComments = content.replace(
        /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        (m, g) => (g ? '' : m)
      );
    }

    // ES Modules
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
    switch (options.module) {
      case ts.ModuleKind.ES2015:
      case ts.ModuleKind.ES2020:
      case ts.ModuleKind.ESNext: {
        const imports = findModules(
          contentWithoutComments,
          /import((?:[\s+\w+*{},./[\]]*)|(\s+)|(\())["|'|`](.*?)["|'|`](?:[)]*)(?:[;]*)/gi,
          npmModules
        );

        content = correctPath(content, imports, paths, pathLevels, true);
        break;
      }
    }

    const requires = findModules(
      contentWithoutComments,
      /require\(["|'|`](.*?)["|'|`]\)/gi,
      npmModules
    );

    content = correctPath(content, requires, paths, pathLevels, false);

    // Save script file
    try {
      outputFileSync(filePath, content, {
        encoding: 'utf8'
      });
    } catch (error) {
      log.error(error?.message ?? '');
    }
  });
};

export { fixImports };
