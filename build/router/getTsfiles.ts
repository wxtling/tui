import path from 'path';

import { build } from 'esbuild';
import module from "module"

function loadConfigFromBundledFile(fileName: string, bundledCode: string) {
  // @ts-expect-error
  module.Module._extensions['.ts'] = function (module: any, filename: string) {
    if (filename === fileName) {
      module._compile(bundledCode, fileName);
    }
  };

  let config;
  delete require.cache[fileName];
  const raw = require(fileName);
  config = raw.__esModule ? raw.default : raw;
  return config;
}

export async function resolveModule(p: string): Promise<any> {
  const url = path.join(p);
  const result = await build({
    entryPoints: [url],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: 'cjs',
    metafile: true,
    target: 'es2015',
  });
  const { text } = result.outputFiles[0];

  return await loadConfigFromBundledFile(url, text);
}
