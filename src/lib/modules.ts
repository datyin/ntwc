import { builtinModules } from 'module';
import { trim } from 'lodash';
import { pathSlash } from './filesystem';

export enum ScriptType {
  UNKNOWN = 0,
  LOCAL_FILE,
  EXTERNAL_MODULE,
  BUILT_IN_MODULE
}

export interface IModulesFound {
  import: string;
  quote: string;
  path: string;
  type: ScriptType;
}

type QuoteSymbol = '"' | "'" | '`' | '';

function quoteSymbol(input: string): QuoteSymbol {
  input = trim(input);
  let quote: QuoteSymbol = '';

  if (input.startsWith('`')) {
    quote = '`';
  } else if (input.startsWith('"')) {
    quote = '"';
  } else if (input.startsWith("'")) {
    quote = "'";
  }

  return quote;
}

export function findModules(
  content: string,
  pattern: RegExp,
  npmModules: string[]
): IModulesFound[] {
  const importsFound = content.match(pattern);

  if (!importsFound) {
    return [];
  }

  const output: IModulesFound[] = [];
  importsFound.forEach((v) => {
    // Extract only path form import
    const pathFound = v.match(/["|'|`](.*?)["|'|`]/gi);

    if (!pathFound || !pathFound[0]) {
      return;
    }

    const quote = quoteSymbol(pathFound[0]);
    const pathWithoutQuotes = trim(pathFound[0], `'"\``);
    const pathWithoutQuotesLC = trim(pathFound[0], `'"\``).toLowerCase();
    const unixLikePath = pathSlash(pathWithoutQuotes);

    // Script Type
    let type = 0;

    // prettier-ignore
    if (builtinModules.includes(pathWithoutQuotes) || pathWithoutQuotesLC.startsWith('node:')) {
      type = ScriptType.BUILT_IN_MODULE;
    }
    else if (npmModules.includes(pathWithoutQuotes)) {
      type = ScriptType.EXTERNAL_MODULE;
    }
    else if (pathWithoutQuotesLC.startsWith('file:') || unixLikePath.startsWith('./')) {
      type = ScriptType.LOCAL_FILE;
    }

    output.push({
      import: v,
      quote,
      path: pathWithoutQuotes,
      type
    });
  });

  return output;
}
