import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const PACKAGE_VERSION = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version

// Build configuration
const buildConfig = {
  isProd: process.env.NODE_ENV?.trim() === 'production',
  isDev: process.env.NODE_ENV?.trim() === 'development' || !process.env.NODE_ENV,
  
  // Output configuration
  distDir: 'dist',
  srcDir: 'src',
  loaderDir: 'src/lex-web-ui-loader'
}

// Banner plugin for adding license headers
const bannerPlugin = () => ({
  name: 'banner-plugin',
  generateBundle(options, bundle) {
    if (!buildConfig.isProd) return
    
    const banner = `/*!
* lex-web-ui-loader v${PACKAGE_VERSION}
* (c) 2017-2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* Released under the Amazon Software License.
*/`
    
    for (const fileName in bundle) {
      const chunk = bundle[fileName]
      if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
        chunk.code = banner + '\n' + chunk.code
      }
    }
  }
})

// HTML plugin to copy and process HTML files to dist
const htmlPlugin = () => ({
  name: 'html-plugin',
  closeBundle() {
    const websiteDir = path.join(buildConfig.srcDir, 'website')
    const htmlFiles = ['index.html', 'parent.html']
    
    // Determine which files to inject based on build mode
    const loaderJs = buildConfig.isProd ? 'lex-web-ui-loader.min.js' : 'lex-web-ui-loader.js'
    const loaderCss = buildConfig.isProd ? 'lex-web-ui-loader.min.css' : 'lex-web-ui-loader.css'
    
    htmlFiles.forEach(file => {
      const srcPath = path.join(websiteDir, file)
      const destPath = path.join(buildConfig.distDir, file)
      
      if (fs.existsSync(srcPath)) {
        let htmlContent = fs.readFileSync(srcPath, 'utf8')
        
        // Replace Webpack template tags with actual script/link tags
        const headTags = `<link href="./${loaderCss}" rel="stylesheet">`
        const bodyTags = `<script src="./${loaderJs}"></script>`
        
        htmlContent = htmlContent.replace('<%= htmlWebpackPlugin.tags.headTags %>', headTags)
        htmlContent = htmlContent.replace('<%= htmlWebpackPlugin.tags.bodyTags %>', bodyTags)
        
        fs.writeFileSync(destPath, htmlContent)
        console.log(`  ✓ Processed and copied HTML: ${file}`)
      }
    })
  }
})

export default defineConfig({
  plugins: [
    // Node.js polyfills for browser compatibility
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    bannerPlugin(),
    htmlPlugin()
  ],
  
  define: {
    'process.env.PACKAGE_VERSION': JSON.stringify(PACKAGE_VERSION),
    'process.env.NODE_ENV': JSON.stringify(buildConfig.isProd ? 'production' : 'development')
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, buildConfig.srcDir)
    },
    extensions: ['.mjs', '.js', '.json']
  },
  
  build: {
    lib: {
      entry: path.resolve(__dirname, buildConfig.loaderDir, 'js', 'index.js'),
      name: 'ChatBotUiLoader',
      formats: ['umd'],
      fileName: () => buildConfig.isProd ? 'lex-web-ui-loader.min.js' : 'lex-web-ui-loader.js'
    },
    outDir: buildConfig.distDir,
    emptyOutDir: false, // Don't clean dist as it contains other files
    sourcemap: true,
    minify: buildConfig.isProd,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Ensure the global variable is properly set
        exports: 'named',
        // Ensure CSS files are named consistently
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return buildConfig.isProd ? 'lex-web-ui-loader.min.css' : 'lex-web-ui-loader.css'
          }
          return '[name].[ext]'
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 8000,
    host: true,
    open: '/src/website/index.html',
    strictPort: false,
    cors: true,
    // Serve static files from multiple directories
    fs: {
      allow: ['.']
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: buildConfig.isDev,
    postcss: './postcss.config.js'
  }
})
