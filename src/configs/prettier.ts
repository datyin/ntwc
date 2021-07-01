import { assignIn, isPlainObject } from 'lodash';
import log from '../lib/logger';
import { createFile, readJson, saveConfig } from '../lib/filesystem';

const fileName = '.prettierrc.json';
const fileNameIgnore = '.prettierignore';

export const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'none',
  endOfLine: 'lf'
};

export async function create(): Promise<void> {
  log.print(`⏳  Generating ${fileName}...`);

  if (!saveConfig(`./${fileName}`, config)) {
    log.clearLastLine();
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
}

export async function createIgnorePattern(): Promise<void> {
  log.print(`⏳  Generating ${fileNameIgnore}...`);

  if (!createFile(`./${fileNameIgnore}`, [`dist/`, `node_modules/`, `package-lock.json`])) {
    log.error(`❌  Failed to generate ${fileNameIgnore}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileNameIgnore} generated.`);
}

export async function load(): Promise<void> {
  const cfg = readJson(`./${fileName}`);

  if (isPlainObject(cfg)) {
    assignIn(config, cfg);
  }
}
