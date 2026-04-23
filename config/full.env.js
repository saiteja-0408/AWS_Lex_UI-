/**
 * Configs to be updated when performing a full build from source
 * This module exports an object with a key for each config file
 * Each key contains the file name and the associated config object
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import mergeConfig from './utils/merge-config.js';
import baseConfig from './base.env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config files to update
const confFileNames = {
  appProd:
    process.env.WEBAPP_CONFIG_PROD ||
    path.resolve(__dirname, '../lex-web-ui/src/config/config.prod.json'),

  appDev:
    process.env.WEBAPP_CONFIG_DEV ||
    path.resolve(__dirname, '../lex-web-ui/src/config/config.dev.json'),

  loader:
    process.env.LOADER_CONFIG ||
    path.resolve(__dirname, '../src/config/lex-web-ui-loader-config.json'),
};

const appProdConfig = JSON.parse(readFileSync(confFileNames.appProd, 'utf8'));
const appDevConfig = JSON.parse(readFileSync(confFileNames.appDev, 'utf8'));
const loaderConfig = JSON.parse(readFileSync(confFileNames.loader, 'utf8'));

export default {
  loader: {
    file: confFileNames.loader,
    conf: mergeConfig(loaderConfig, baseConfig),
  },
  appProd: {
    file: confFileNames.appProd,
    conf: mergeConfig(appProdConfig, baseConfig),
  },
  appDev: {
    file: confFileNames.appDev,
    conf: mergeConfig(appDevConfig, baseConfig),
  },
};
