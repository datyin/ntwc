import chalk from 'chalk';
import dateFormat from 'dateformat';

const prefix = chalk`[{blue NTWC}]`;

function log(type: string, ...args: unknown[]): void {
  const date = dateFormat(new Date(), 'HH:MM:ss');
  const datePrefix = chalk`{gray.bold.italic ${date}}`;

  switch (type) {
    default: {
      console.log(prefix, datePrefix, ...args);
      break;
    }
    case 'ERROR': {
      console.error(prefix, datePrefix, chalk`{redBright ERROR}`, ...args);
      break;
    }
    case 'WARN': {
      console.warn(prefix, datePrefix, chalk`{yellowBright WARN}`, ...args);
      break;
    }
    case 'SUCCESS': {
      console.log(prefix, datePrefix, chalk`{greenBright SUCCESS}`, ...args);
      break;
    }
    case 'INFO': {
      console.info(prefix, datePrefix, chalk`{cyanBright INFO}`, ...args);
      break;
    }
  }
}

function clearLastLine(): void {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
}

function error(...args: unknown[]): void {
  log('ERROR', ...args);
}

function warn(...args: unknown[]): void {
  log('WARN', ...args);
}

function success(...args: unknown[]): void {
  log('SUCCESS', ...args);
}

function info(...args: unknown[]): void {
  log('INFO', ...args);
}

function print(...args: unknown[]): void {
  log('', ...args);
}

export default {
  print,
  error,
  warn,
  success,
  info,
  clearLastLine
};
