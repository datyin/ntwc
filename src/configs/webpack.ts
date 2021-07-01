const fileName = 'webpack.config.js';

export const config = {};

export async function create(): Promise<void> {
  // No need
}

export async function load(): Promise<void> {
  // TODO: re-require file
  console.log(fileName);
}
