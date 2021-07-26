import { assignIn, isPlainObject } from 'lodash';
import log from '../lib/logger';
import { createFile, readJson, saveConfig } from '../lib/filesystem';

const fileName = '.prettierrc.json';
const fileNameIgnore = '.prettierignore';

const ignored = [`dist/`, `bundle/`, `node_modules/`, `package-lock.json`];

export const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'none',
  endOfLine: 'lf'
};

export async function create(): Promise<void> {
  if (!saveConfig(`./${fileName}`, config)) {
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.print(`✔️  ${fileName} generated.`);
}

export async function createIgnorePattern(): Promise<void> {
  if (!createFile(`./${fileNameIgnore}`, ignored)) {
    log.error(`❌  Failed to generate ${fileNameIgnore}`);
    process.exit(1);
  }

  log.print(`✔️  ${fileNameIgnore} generated.`);
}

export async function load(): Promise<void> {
  const cfg = readJson(`./${fileName}`);

  if (isPlainObject(cfg)) {
    assignIn(config, cfg);
  }
}
