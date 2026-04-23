// Usage: npm start
// Serves the prebuilt `dist` sample site and `src/config` (loader JSON/CSS).
// For component hot reload, use: cd lex-web-ui && npm run serve
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8000;
const publicPath = '/';

const distDir = path.join(__dirname, 'dist');
const configDir = path.join(__dirname, 'src/config');
const websiteDir = path.join(__dirname, 'src/website');
const app = express();

app.use(publicPath, express.static(configDir));
app.use(publicPath, express.static(distDir));
// Demo pages: right-panel.html, parent.html sources (loader + static HTML)
app.use(publicPath, express.static(websiteDir));

app.listen(port, function () {
  console.log(`App listening on: http://localhost:${port}`);
});
