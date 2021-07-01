import chalk from 'chalk';
import log from '../lib/logger';

export default function (): void {
  log.info(
    'Usage:\n',

    `To generate new project use:\n`,
    chalk`    {blue ntwc} {cyan create} {gray.italic [options]}\n`,
    `To run dev mode:\n`,
    chalk`    {blue ntwc} {cyan serve} {gray.italic [options]}\n`,
    `To build project:\n`,
    chalk`    {blue ntwc} {cyan build} {gray.italic [options]}\n`,
    `To change target:\n`,
    chalk`    {blue ntwc} {cyan change} {gray.italic [options]}\n`,
    `To add new entry:\n`,
    chalk`    {blue ntwc} {cyan add} {gray.italic [options]}\n`
  );
}
