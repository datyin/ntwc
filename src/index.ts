import minimist from 'minimist';
import { get, toString } from 'lodash';
import globals from './global';
import help from './commands/help';
import create from './modules/create';
import serve from './modules/serve';
import build from './modules/build';
import change from './modules/change';
import add from './modules/add';

const argv = minimist(process.argv.slice(2));
const mode = toString(get(argv, '_.0', '')).toLowerCase();
globals.argv = argv;

if (argv['help'] || argv['h']) {
  help();
  process.exit(0);
}

switch (mode) {
  case 'create':
  case 'init':
  case 'generate': {
    create();
    break;
  }
  case 'serve':
  case 'watch':
  case 'dev': {
    serve();
    break;
  }
  case 'build':
  case 'compile': {
    build();
    break;
  }
  case 'change': {
    change();
    break;
  }
  case 'add': {
    add();
    break;
  }
  default: {
    help();
    break;
  }
}
