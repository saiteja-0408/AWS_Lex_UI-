import fs from 'fs'
import path from 'path'

/**
 * Handle copying individual assets with fallback logic
 */
function handleAssetCopy(customPath, fallbackPath, outputPath, assetType, root) {
  const customAsset = path.resolve(root, customPath)
  const fallbackAsset = path.resolve(root, fallbackPath)

  try {
    if (fs.existsSync(customAsset)) {
      fs.copyFileSync(customAsset, outputPath)
      console.log(`✅ Copied custom ${assetType}: ${customPath} → ${path.relative(root, outputPath)}`)
    } else if (fs.existsSync(fallbackAsset)) {
      fs.copyFileSync(fallbackAsset, outputPath)
      console.log(`⚠️  Copied fallback ${assetType}: ${fallbackPath} → ${path.relative(root, outputPath)}`)
    } else {
      console.warn(`❌ Neither custom nor fallback ${assetType} found`)
    }
  } catch (error) {
    console.error(`❌ Error copying ${assetType}:`, error.message)
  }
}

/**
 * Copy public directory contents while maintaining structure
 */
function copyPublicDirectory(publicDir, outputPath, root) {
  const publicPath = path.resolve(root, publicDir)
  
  if (!fs.existsSync(publicPath)) {
    console.log(`ℹ️  Public directory not found: ${publicDir}`)
    return
  }

  try {
    copyDirectoryRecursive(publicPath, outputPath)
    console.log(`✅ Copied public directory: ${publicDir} → ${path.relative(root, outputPath)}`)
  } catch (error) {
    console.error(`❌ Error copying public directory:`, error.message)
  }
}

/**
 * Recursively copy directory contents
 */
function copyDirectoryRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true })
      }
      // Recursively copy directory contents
      copyDirectoryRecursive(srcPath, destPath)
    } else if (entry.isFile()) {
      // Skip index.html as Vite handles it separately
      if (entry.name !== 'index.html') {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath)
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        // Copy file
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}

/**
 * Custom Vite plugin for asset handling and fallback logic
 * Handles favicon.png and logo.png with fallback to material design icons
 * 
 * Requirements addressed:
 * - 6.1: Copy favicon.png and logo.png from src/assets if they exist
 * - 6.2: Fall back to default material design icons when custom assets missing
 * - 6.4: Maintain public directory structure and asset paths
 */
export function assetHandlerPlugin(options = {}) {
  const {
    faviconPath = 'src/assets/favicon.png',
    logoPath = 'src/assets/logo.png',
    fallbackFaviconPath = 'node_modules/material-design-icons/maps/2x_web/ic_local_florist_white_18dp.png',
    fallbackLogoPath = 'node_modules/material-design-icons/maps/2x_web/ic_local_florist_white_24dp.png',
    outputDir = 'dist',
    publicDir = 'public'
  } = options

  let isProduction = false
  let root = process.cwd()

  return {
    name: 'asset-handler',
    configResolved(config) {
      isProduction = config.command === 'build'
      root = config.root || process.cwd()
    },

    /**
     * Handle asset resolution and fallback logic
     */
    resolveId(id) {
      // Handle virtual asset imports for favicon and logo
      if (id === 'virtual:favicon' || id === 'virtual:logo') {
        return id
      }
      return null
    },

    /**
     * Load virtual assets with fallback logic
     */
    load(id) {
      if (id === 'virtual:favicon') {
        const customFavicon = path.resolve(root, faviconPath)
        const fallbackFavicon = path.resolve(root, fallbackFaviconPath)
        
        if (fs.existsSync(customFavicon)) {
          console.log(`✅ Using custom favicon: ${faviconPath}`)
          return `export default "${faviconPath}"`
        } else {
          console.log(`⚠️  Custom favicon not found, using fallback: ${fallbackFaviconPath}`)
          return `export default "${fallbackFaviconPath}"`
        }
      }

      if (id === 'virtual:logo') {
        const customLogo = path.resolve(root, logoPath)
        const fallbackLogo = path.resolve(root, fallbackLogoPath)
        
        if (fs.existsSync(customLogo)) {
          console.log(`✅ Using custom logo: ${logoPath}`)
          return `export default "${logoPath}"`
        } else {
          console.log(`⚠️  Custom logo not found, using fallback: ${fallbackLogoPath}`)
          return `export default "${fallbackLogoPath}"`
        }
      }

      return null
    },

    /**
     * Generate bundle phase - copy assets to output directory
     */
    generateBundle(options, bundle) {
      if (!isProduction) return

      const outputPath = options.dir || outputDir
      
      // Ensure output directory exists
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
      }

      // Handle favicon
      handleAssetCopy(
        faviconPath,
        fallbackFaviconPath,
        path.join(outputPath, 'favicon.png'),
        'favicon',
        root
      )

      // Handle logo
      handleAssetCopy(
        logoPath,
        fallbackLogoPath,
        path.join(outputPath, 'logo.png'),
        'logo',
        root
      )

      // Copy public directory contents if it exists
      copyPublicDirectory(publicDir, outputPath, root)
    },

    /**
     * Development server middleware for asset fallback
     */
    configureServer(server) {
      server.middlewares.use('/favicon.png', (req, res, next) => {
        const customFavicon = path.resolve(root, faviconPath)
        const fallbackFavicon = path.resolve(root, fallbackFaviconPath)

        if (fs.existsSync(customFavicon)) {
          res.setHeader('Content-Type', 'image/png')
          fs.createReadStream(customFavicon).pipe(res)
        } else if (fs.existsSync(fallbackFavicon)) {
          res.setHeader('Content-Type', 'image/png')
          fs.createReadStream(fallbackFavicon).pipe(res)
        } else {
          next()
        }
      })

      server.middlewares.use('/logo.png', (req, res, next) => {
        const customLogo = path.resolve(root, logoPath)
        const fallbackLogo = path.resolve(root, fallbackLogoPath)

        if (fs.existsSync(customLogo)) {
          res.setHeader('Content-Type', 'image/png')
          fs.createReadStream(customLogo).pipe(res)
        } else if (fs.existsSync(fallbackLogo)) {
          res.setHeader('Content-Type', 'image/png')
          fs.createReadStream(fallbackLogo).pipe(res)
        } else {
          next()
        }
      })
    }
  }
}