import globals from '../../global';
import { createDir, createFile } from '../../lib/filesystem';
import log from '../../lib/logger';

export async function create(): Promise<void> {
  log.print(`⏳  Generating workspace...`);

  createDir('./dist');
  createDir('./resources');
  createFile(`./src/typings/${globals.project.name}/index.d.ts`, '');

  const script = [`console.log('Project: ${globals.project.name}');`];
  createFile(`./src/index.ts`, script);
  createFile(`./dist/index.js`, script);

  log.clearLastLine();
  log.print(`✔️  workspace generated.`);
}
