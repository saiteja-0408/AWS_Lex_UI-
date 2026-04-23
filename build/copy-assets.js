#!/usr/bin/env node

/**
 * Copy assets script - replaces dist/Makefile functionality
 * Copies dependencies and bundle files to dist directory after Vite build
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const distDir = path.join(rootDir, 'dist')
const depsDir = path.join(rootDir, 'src', 'dependencies')
const bundleDir = path.join(rootDir, 'lex-web-ui', 'dist', 'bundle')
const websiteDir = path.join(rootDir, 'src', 'website')

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

console.log('[INFO] Copying dependencies...')

// Copy dependency files
if (fs.existsSync(depsDir)) {
  const files = fs.readdirSync(depsDir)
  files.forEach(file => {
    const srcPath = path.join(depsDir, file)
    const destPath = path.join(distDir, file)
    
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied: ${file}`)
    }
  })
} else {
  console.log('  ⚠ Dependencies directory not found')
}

console.log('[INFO] Copying lex-web-ui bundle files...')

// Copy lex-web-ui bundle files
if (fs.existsSync(bundleDir)) {
  const files = fs.readdirSync(bundleDir)
  files.forEach(file => {
    // Copy lex-web-ui and worker files
    if (file.match(/^(lex-web-ui|wav-worker)\.(min\.)?(js|css|map)$/)) {
      const srcPath = path.join(bundleDir, file)
      const destPath = path.join(distDir, file)
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied bundle: ${file}`)
    }
  })
} else {
  console.log('  ⚠ Bundle directory not found - run "cd lex-web-ui && npm run build-dist" first')
}

console.log('[INFO] Copying website files...')

// Copy website files (HTML, CSS)
if (fs.existsSync(websiteDir)) {
  const websiteFiles = ['custom-chatbot-style.css', 'right-panel.html']
  websiteFiles.forEach(file => {
    const srcPath = path.join(websiteDir, file)
    const destPath = path.join(distDir, file)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`  ✓ Copied: ${file}`)
    }
  })
}

console.log('[INFO] Asset copying complete!')
