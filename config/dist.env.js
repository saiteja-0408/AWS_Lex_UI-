/**
 * Config used when deploying the app using the pre-built dist library
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import mergeConfig from './utils/merge-config.js';
import baseConfig from './base.env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loaderConfigFileName =
  process.env.LOADER_CONFIG ||
  path.resolve(__dirname, '../src/config/lex-web-ui-loader-config.json');
const loaderConfig = JSON.parse(readFileSync(loaderConfigFileName, 'utf8'));


const currentConfigFileName = path.resolve(__dirname, '../' + process.env.CURRENT_CONFIG_FILE);
const currentConfig = JSON.parse(readFileSync(currentConfigFileName, 'utf8'));
/* merge currentConfig with loader default config*/
if (currentConfig['connect'] === undefined) {
  console.log(`adding connect to currentConfig`);
  currentConfig['connect'] = {};
  console.log(`new currentConfig ${JSON.stringify(currentConfig)}`);
}
const userConfig = mergeConfig(currentConfig, baseConfig);

export default {
  appPreBuilt: {
    file: loaderConfigFileName,
    conf: mergeConfig(userConfig, baseConfig),
  },
};
