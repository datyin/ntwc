import _ from 'lodash';
import webpack from 'webpack';
import nodeModules from 'webpack-node-externals';
import { getEntries } from '../common/entries';
import globals from '../global';
import { getVersion } from '../lib/version';
import log from '../lib/logger';
import * as ntwc from './ntwc';

export const config = {
  resolve: {
    extensions: ['.js']
  },
  externals: [
    nodeModules({
      modulesDir: globals.project.root + '/node_modules'
    })
  ]
};

export async function create(): Promise<void> {
  // No need
}

export async function load(): Promise<void> {
  _.set(config, 'mode', 'production');

  const entries: Record<string, string> = {};

  getEntries().forEach((e) => {
    entries[e.name] = `./${e.name}.js`;
  });

  _.set(config, 'context', ntwc.config.structure.distribution);
  _.set(config, 'entry', entries);

  if (globals.project.target === 'esnext') {
    _.set(config, 'target', 'node');
  } else {
    const version = getVersion(globals.project.target);

    if (version) {
      _.set(config, 'target', `node${version.major}.${version.minor}`);
    } else {
      _.set(config, 'target', 'node');
    }
  }

  _.unset(config, 'output.libraryTarget');
  _.unset(config, 'output.library.name');
  _.unset(config, 'experiments.outputModule');

  _.set(config, 'output.path', ntwc.config.structure.bundle);

  // ES Modules are still not supported by webpack
  // https://github.com/webpack/webpack/issues/2933#issuecomment-774253975
  _.set(config, 'output.library.type', 'commonjs2');

  // NodeJS things
  _.set(config, 'externalsPresets.node', true);
  _.set(config, 'node.global', false);
  _.set(config, 'node.__filename', false);
  _.set(config, 'node.__dirname', false);
}

export function compile(): Promise<void> {
  return new Promise((resolve) => {
    log.print(`⏳  Bundling project...`);
    const bundler = webpack(config);

    bundler.run((err, stats) => {
      if (err || !stats) {
        log.error(err);
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        info.errors?.forEach((e) => log.error(e.message));
        return;
      }

      if (stats.hasWarnings()) {
        info.warnings?.forEach((w) => log.warn(w.message));
      }

      bundler.close((closeError) => {
        if (closeError) {
          log.error(closeError);
        }

        if (globals.project.module !== 'commonjs') {
          log.warn(
            `WebPack still doesn't fully support output as ES Modules.`,
            `Your project is bundled as CommonJS`
          );
        }

        log.clearLastLine();
        log.print('✔️  Successfully bundled');
        resolve();
      });
    });
  });
}
