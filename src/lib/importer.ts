import _ from 'lodash';
import ts from 'typescript';
import { join } from 'path';
import { outputFileSync, statSync } from 'fs-extra';
import { findModules, IModulesFound, ScriptType } from './modules';
import log from './logger';
import * as ntwc from '../configs/ntwc';
import * as TSC from '../schema/tsc';
import { fullPath } from './filesystem';

type SS = Record<string, string>;

function appendIndex(input: string): string {
  const path = fullPath(join(ntwc.config.structure.distribution, input));

  try {
    return statSync(path).isDirectory() ? input + '/index' : input;
  } catch (error) {
    return input;
  }
}

function correctPath(
  content: string,
  imports: IModulesFound[],
  paths: TSC.Paths[],
  pathLevels: number,
  addExtension: boolean
): string {
  _.forEach(imports, (i) => {
    if (i.type === ScriptType.EXTERNAL_MODULE || i.type === ScriptType.BUILT_IN_MODULE) {
      return;
    }

    // Unknown is probably path alias
    if (i.type === ScriptType.UNKNOWN) {
      _.forEach(paths, (p) => {
        // convert alias path to relative path
        if (i.path.startsWith(p.alias)) {
          const path = `./${_.repeat('../', pathLevels)}${p.path}`;
          let deAlias = i.path.replace(p.alias, path);

          // Missing extension
          if (addExtension && !deAlias.endsWith('.js')) {
            deAlias = appendIndex(deAlias);
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

    if (addExtension) {
      // Add extension to local file without extension
      if (!i.path.endsWith('.js')) {
        const originalPath = i.path;
        // add missing /index if directory is provided
        i.path = appendIndex(i.path);

        const correct = i.import.replace(
          `${i.quote}${originalPath}${i.quote}`,
          `${i.quote}${i.path}.js${i.quote}`
        );

        content = content.replace(i.import, correct);
      }
    }
  });

  return content;
}

export function fixImports(
  options: ts.CompilerOptions,
  paths: TSC.Paths[],
  npmModules: string[],
  files: SS
): string[] {
  const externals: string[] = [];

  _.forEach(files, (content, filePath) => {
    const shortPath = filePath.replace(ntwc.config.structure.distribution + '/', '');
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

        externals.push(
          ...imports.filter((i) => i.type === ScriptType.EXTERNAL_MODULE).map((i) => i.path)
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

    externals.push(
      ...requires.filter((i) => i.type === ScriptType.EXTERNAL_MODULE).map((i) => i.path)
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

  return externals;
}
