import { ChildProcess } from 'child_process';
import spawn from 'cross-spawn';
import stringArgv from 'string-argv';
import _ from 'lodash';
import * as ntwc from '../configs/ntwc';
import globals from '../global';
import log from './logger';

let childs: ChildProcess[] = [];

export function close(): void {
  _.forEach(childs, (cp) => {
    if (!cp) {
      return;
    }

    cp.removeAllListeners();
    cp.kill('SIGTERM');
  });

  childs = [];
}

export function execute(): void {
  close();

  ntwc.config.entries.forEach((entry) => {
    if (!entry.runAfterDevBuild) {
      return;
    }

    const root = ntwc.config.structure.distribution.replace(globals.project.root, '.');
    const src = `${root}/${entry.script}.js`;
    const args: string[] = [];

    if (entry.argv) {
      args.push(...stringArgv(entry.argv));
    }

    const cp = spawn('node', [src, ...args], {
      stdio: 'inherit',
      cwd: globals.project.root
    });

    cp.on('spawn', () => log.info(`${src} executed.`));
    cp.on('error', (err) => console.error(err));
    cp.on('message', (message) => console.log(message));
    cp.on('exit', (code) => log.info(`${src} exited (code: ${code})`));

    childs.push(cp);
  });
}
