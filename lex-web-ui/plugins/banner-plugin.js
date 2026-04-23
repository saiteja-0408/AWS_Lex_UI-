/**
 * Custom Vite plugin for banner injection
 * Adds license headers with version and license information to library builds
 */
import fs from 'fs'
import path from 'path'

/**
 * Creates a banner plugin that adds license headers to library builds
 * @param {Object} options - Plugin configuration options
 * @param {boolean} options.isLibraryBuild - Whether this is a library build
 * @param {string} options.packageJsonPath - Path to package.json file
 * @returns {Object} Vite plugin object
 */
export function bannerPlugin(options = {}) {
  const { isLibraryBuild = false, packageJsonPath = './package.json' } = options
  
  // Only apply banner to library builds
  if (!isLibraryBuild) {
    return {
      name: 'banner-plugin',
      // Return empty plugin for non-library builds
    }
  }

  let packageInfo
  
  return {
    name: 'banner-plugin',
    
    buildStart() {
      // Read package.json information at build start
      try {
        const packageJsonFullPath = path.resolve(packageJsonPath)
        const packageJsonContent = fs.readFileSync(packageJsonFullPath, 'utf8')
        packageInfo = JSON.parse(packageJsonContent)
      } catch (error) {
        this.error(`Failed to read package.json: ${error.message}`)
      }
    },
    
    generateBundle(options, bundle) {
      // Generate banner text from package.json information
      const banner = createBanner(packageInfo)
      
      // Add banner to all JavaScript and CSS files in the bundle
      Object.keys(bundle).forEach(fileName => {
        const file = bundle[fileName]
        
        // Only add banner to JS and CSS files
        if (file.type === 'chunk' || (file.type === 'asset' && file.fileName.endsWith('.css'))) {
          if (file.type === 'chunk') {
            // For JavaScript files
            file.code = banner + '\n' + file.code
          } else if (file.type === 'asset' && file.fileName.endsWith('.css')) {
            // For CSS files - handle both string and Uint8Array sources
            if (typeof file.source === 'string') {
              file.source = banner + '\n' + file.source
            } else if (file.source instanceof Uint8Array) {
              // Convert Uint8Array to string, add banner, then convert back
              const decoder = new TextDecoder('utf-8')
              const encoder = new TextEncoder()
              const cssContent = decoder.decode(file.source)
              const newContent = banner + '\n' + cssContent
              file.source = encoder.encode(newContent)
            }
          }
        }
      })
    }
  }
}

/**
 * Creates a banner comment string from package information
 * @param {Object} packageInfo - Package.json content
 * @returns {string} Banner comment string
 */
function createBanner(packageInfo) {
  const currentYear = new Date().getFullYear()
  const buildDate = new Date().toISOString().split('T')[0]
  
  return `/*!
 * ${packageInfo.name || 'Unknown Package'} v${packageInfo.version || '0.0.0'}
 * ${packageInfo.description || ''}
 * 
 * Copyright (c) ${currentYear} ${packageInfo.author || 'Unknown Author'}
 * Licensed under ${packageInfo.license || 'Unknown License'}
 * 
 * Built on: ${buildDate}
 */`
}

export default bannerPlugin