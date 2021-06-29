import log from '../lib/logger';
import { createFile, saveConfig } from '../lib/filesystem';

const fileName = '.prettierrc.json';
const fileNameIgnore = '.prettierignore';

const config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  trailingComma: 'none',
  endOfLine: 'lf'
};

const create = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileName}...`);

  if (!saveConfig(`./${fileName}`, config)) {
    log.clearLastLine();
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
};

const createIgnorePattern = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileNameIgnore}...`);

  createFile(`./${fileNameIgnore}`, [`dist/`, `node_modules/`, `package-lock.json`]);

  log.clearLastLine();
  log.print(`✔️  ${fileNameIgnore} generated.`);
};

export { config, create, createIgnorePattern };
