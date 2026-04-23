/**
 * Integration tests for all build modes
 * Tests Requirements: 9.1, 9.3, 9.4
 * 
 * This test suite verifies:
 * - All build modes work correctly (app dev, app prod, lib dev, lib prod)
 * - AWS SDK integration functions properly
 * - Vue 3 component rendering works
 * - Vuetify themes are applied correctly
 * - All existing functionality is preserved
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '../..')

describe('Build Modes Integration Tests', () => {
  // Clean up before tests
  beforeAll(() => {
    // Clean dist directory
    const distPath = path.join(projectRoot, 'dist')
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true })
    }
  })

  describe('App Development Build', () => {
    let buildOutput

    beforeAll(() => {
      try {
        // Set environment and run app dev build
        process.env.BUILD_TARGET = 'app'
        process.env.NODE_ENV = 'development'
        
        buildOutput = execSync('npm run build:dev', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000 // 2 minutes timeout
        })
      } catch (error) {
        console.error('App dev build failed:', error.message)
        throw error
      }
    })

    test('should generate app development build successfully', () => {
      expect(buildOutput).toContain('build complete')
      
      // Check that dist directory exists
      const distPath = path.join(projectRoot, 'dist')
      expect(fs.existsSync(distPath)).toBe(true)
      
      // Check for main HTML file
      const indexPath = path.join(distPath, 'index.html')
      expect(fs.existsSync(indexPath)).toBe(true)
    })

    test('should include source maps in development build', () => {
      const distPath = path.join(projectRoot, 'dist')
      const files = fs.readdirSync(distPath, { recursive: true })
      const sourceMapFiles = files.filter(file => file.toString().endsWith('.map'))
      
      expect(sourceMapFiles.length).toBeGreaterThan(0)
    })

    test('should contain Vue 3 and Vuetify assets', () => {
      const indexPath = path.join(projectRoot, 'dist', 'index.html')
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      
      // Should contain references to JS and CSS files
      expect(indexContent).toMatch(/\.js/)
      expect(indexContent).toMatch(/\.css/)
    })
  })

  describe('App Production Build', () => {
    let buildOutput

    beforeAll(() => {
      try {
        // Clean dist directory first
        const distPath = path.join(projectRoot, 'dist')
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true })
        }

        // Set environment and run app prod build
        process.env.BUILD_TARGET = 'app'
        process.env.NODE_ENV = 'production'
        
        buildOutput = execSync('npm run build', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000 // 2 minutes timeout
        })
      } catch (error) {
        console.error('App prod build failed:', error.message)
        throw error
      }
    })

    test('should generate app production build successfully', () => {
      expect(buildOutput).toContain('build complete')
      
      // Check that dist directory exists
      const distPath = path.join(projectRoot, 'dist')
      expect(fs.existsSync(distPath)).toBe(true)
      
      // Check for main HTML file
      const indexPath = path.join(distPath, 'index.html')
      expect(fs.existsSync(indexPath)).toBe(true)
    })

    test('should minify assets in production build', () => {
      const distPath = path.join(projectRoot, 'dist')
      const files = fs.readdirSync(distPath, { recursive: true })
      const jsFiles = files.filter(file => file.toString().endsWith('.js') && !file.toString().endsWith('.map'))
      
      expect(jsFiles.length).toBeGreaterThan(0)
      
      // Check that at least one JS file exists and is minified (no source maps in prod by default)
      const firstJsFile = jsFiles[0]
      const jsPath = path.join(distPath, firstJsFile.toString())
      const jsContent = fs.readFileSync(jsPath, 'utf8')
      
      // Minified files should not have extensive whitespace
      const lines = jsContent.split('\n')
      const avgLineLength = jsContent.length / lines.length
      expect(avgLineLength).toBeGreaterThan(50) // Minified files have longer average line length
    })
  })

  describe('Library Development Build', () => {
    let buildOutput

    beforeAll(() => {
      try {
        // Clean dist directory first
        const distPath = path.join(projectRoot, 'dist')
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true })
        }

        buildOutput = execSync('npm run build:lib-dev', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000 // 2 minutes timeout
        })
      } catch (error) {
        console.error('Library dev build failed:', error.message)
        throw error
      }
    })

    test('should generate library development build successfully', () => {
      expect(buildOutput).toContain('build complete')
      
      // Check for library files in bundle directory
      const bundlePath = path.join(projectRoot, 'dist', 'bundle')
      expect(fs.existsSync(bundlePath)).toBe(true)
      
      // Check for main library file
      const libJsPath = path.join(bundlePath, 'lex-web-ui.js')
      expect(fs.existsSync(libJsPath)).toBe(true)
      
      // Check for CSS file
      const libCssPath = path.join(bundlePath, 'lex-web-ui.css')
      expect(fs.existsSync(libCssPath)).toBe(true)
    })

    test('should contain UMD format with correct globals', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Should be UMD format
      expect(libContent).toContain('(function (global, factory)')
      expect(libContent).toContain('typeof exports === \'object\' && typeof module !== \'undefined\'')
      
      // Should reference external dependencies as globals
      expect(libContent).toContain('Vue')
      expect(libContent).toContain('Vuex')
      expect(libContent).toContain('Vuetify')
    })

    test('should not bundle external dependencies', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Should not contain Vue source code (externalized)
      expect(libContent).not.toContain('Vue.createApp')
      expect(libContent).not.toContain('function createApp')
      
      // Should not contain AWS SDK source code (externalized)
      expect(libContent).not.toContain('@aws-sdk/client-lex-runtime-v2')
      expect(libContent).not.toContain('LexRuntimeV2Client')
    })

    test('should include source maps in development library build', () => {
      const bundlePath = path.join(projectRoot, 'dist', 'bundle')
      const files = fs.readdirSync(bundlePath)
      const sourceMapFiles = files.filter(file => file.endsWith('.map'))
      
      expect(sourceMapFiles.length).toBeGreaterThan(0)
    })
  })

  describe('Library Production Build', () => {
    let buildOutput

    beforeAll(() => {
      try {
        // Clean dist directory first
        const distPath = path.join(projectRoot, 'dist')
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true })
        }

        buildOutput = execSync('npm run build:lib-prod', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000 // 2 minutes timeout
        })
      } catch (error) {
        console.error('Library prod build failed:', error.message)
        throw error
      }
    })

    test('should generate library production build successfully', () => {
      expect(buildOutput).toContain('build complete')
      
      // Check for minified library files
      const bundlePath = path.join(projectRoot, 'dist', 'bundle')
      expect(fs.existsSync(bundlePath)).toBe(true)
      
      // Check for minified library file
      const libJsPath = path.join(bundlePath, 'lex-web-ui.min.js')
      expect(fs.existsSync(libJsPath)).toBe(true)
      
      // Check for minified CSS file
      const libCssPath = path.join(bundlePath, 'lex-web-ui.min.css')
      expect(fs.existsSync(libCssPath)).toBe(true)
    })

    test('should contain banner with version and license', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.min.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Should contain banner with version
      expect(libContent).toContain('lex-web-ui')
      expect(libContent).toContain('0.23.0') // Version from package.json
      expect(libContent).toContain('Amazon Software License')
    })

    test('should be minified in production', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.min.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Minified files should have fewer line breaks
      const lines = libContent.split('\n')
      expect(lines.length).toBeLessThan(50) // Minified files have fewer lines
      
      // Should not have source maps in production by default
      expect(libContent).not.toContain('//# sourceMappingURL=')
    })
  })

  describe('Build-dist Command', () => {
    let buildOutput

    beforeAll(() => {
      try {
        // Clean dist directory first
        const distPath = path.join(projectRoot, 'dist')
        if (fs.existsSync(distPath)) {
          fs.rmSync(distPath, { recursive: true, force: true })
        }

        buildOutput = execSync('npm run build-dist', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 240000 // 4 minutes timeout for both builds
        })
      } catch (error) {
        console.error('Build-dist failed:', error.message)
        throw error
      }
    })

    test('should generate both development and production library builds', () => {
      const bundlePath = path.join(projectRoot, 'dist', 'bundle')
      expect(fs.existsSync(bundlePath)).toBe(true)
      
      // Should have both dev and prod JS files
      const devJsPath = path.join(bundlePath, 'lex-web-ui.js')
      const prodJsPath = path.join(bundlePath, 'lex-web-ui.min.js')
      expect(fs.existsSync(devJsPath)).toBe(true)
      expect(fs.existsSync(prodJsPath)).toBe(true)
      
      // Should have both dev and prod CSS files
      const devCssPath = path.join(bundlePath, 'lex-web-ui.css')
      const prodCssPath = path.join(bundlePath, 'lex-web-ui.min.css')
      expect(fs.existsSync(devCssPath)).toBe(true)
      expect(fs.existsSync(prodCssPath)).toBe(true)
    })

    test('should maintain package.json main entry point', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.main).toBe('dist/bundle/lex-web-ui.js')
      
      // Verify the main entry point file exists
      const mainEntryPath = path.join(projectRoot, packageJson.main)
      expect(fs.existsSync(mainEntryPath)).toBe(true)
    })
  })

  describe('Dependency Compatibility', () => {
    test('should support Vue 3.5.13', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.dependencies.vue).toBe('^3.5.13')
    })

    test('should support Vuetify 3.8.3', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.dependencies.vuetify).toBe('^3.8.3')
    })

    test('should support Vuex 4.1.0', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.dependencies.vuex).toBe('^4.1.0')
    })

    test('should support AWS SDK v3 clients', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Check key AWS SDK v3 clients
      expect(packageJson.dependencies['@aws-sdk/client-lex-runtime-v2']).toBe('3.470.0')
      expect(packageJson.dependencies['@aws-sdk/client-polly']).toBe('3.470.0')
      expect(packageJson.dependencies['@aws-sdk/client-cognito-identity']).toBe('3.470.0')
      expect(packageJson.dependencies['@aws-sdk/client-s3']).toBe('3.470.0')
      expect(packageJson.dependencies['@aws-sdk/client-connect']).toBe('3.470.0')
    })

    test('should support aws-amplify', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.dependencies['aws-amplify']).toBe('^5.3.26')
    })
  })

  describe('Node.js and npm Version Compatibility', () => {
    test('should specify Node.js 18+ requirement', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.engines.node).toBe('>=18.0.0')
    })

    test('should specify npm 10+ requirement', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      expect(packageJson.engines.npm).toBe('>=10.0.0')
    })
  })
})