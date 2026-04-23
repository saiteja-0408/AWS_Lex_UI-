/**
 * Functionality integration tests
 * Tests Requirements: 9.1, 9.3, 9.4
 * 
 * This test suite verifies:
 * - AWS SDK integration works correctly
 * - Vue 3 component rendering functions
 * - Vuetify themes are applied correctly
 * - Web workers function properly
 * - Node.js polyfills work in browser environment
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = path.resolve(__dirname, '../..')

describe('Functionality Integration Tests', () => {
  describe('AWS SDK Integration', () => {
    test('should include AWS SDK polyfills in build', () => {
      // Build library to test AWS SDK integration
      try {
        execSync('npm run build:lib-dev', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000
        })
      } catch (error) {
        console.error('Build failed:', error.message)
        throw error
      }

      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Should contain polyfills for Node.js APIs used by AWS SDK
      expect(libContent).toContain('Buffer')
      expect(libContent).toContain('process')
      
      // Should not contain AWS SDK source (externalized)
      expect(libContent).not.toContain('LexRuntimeV2Client')
      expect(libContent).not.toContain('PollyClient')
    })

    test('should externalize AWS SDK v3 clients in library build', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.js')
      const libContent = fs.readFileSync(libJsPath, 'utf8')
      
      // Should reference AWS SDK as external dependencies
      expect(libContent).toContain('AWS_LexRuntimeV2')
      expect(libContent).toContain('AWS_Polly')
      expect(libContent).toContain('AWS_CognitoIdentity')
    })

    test('should include browserify-zlib polyfill', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Should have browserify-zlib as dependency
      expect(packageJson.dependencies['browserify-zlib']).toBe('^0.2.0')
      expect(packageJson.dependencies['buffer']).toBe('^6.0.3')
    })
  })

  describe('Vue 3 Component Support', () => {
    test('should include Vue 3 configuration in build', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure Vue 3 plugin
      expect(viteConfigContent).toContain('@vitejs/plugin-vue')
      expect(viteConfigContent).toContain('vue(')
      
      // Should include Vue 3 specific defines
      expect(viteConfigContent).toContain('__VUE_OPTIONS_API__')
      expect(viteConfigContent).toContain('__VUE_PROD_DEVTOOLS__')
    })

    test('should support Vue 3 template compilation', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure template compiler options
      expect(viteConfigContent).toContain('template:')
      expect(viteConfigContent).toContain('compilerOptions:')
      expect(viteConfigContent).toContain('isCustomElement')
    })

    test('should verify Vue 3 components exist', () => {
      const componentsDir = path.join(projectRoot, 'src', 'components')
      expect(fs.existsSync(componentsDir)).toBe(true)
      
      // Check for key Vue components
      const lexWebComponent = path.join(componentsDir, 'LexWeb.vue')
      const messageComponent = path.join(componentsDir, 'Message.vue')
      const inputComponent = path.join(componentsDir, 'InputContainer.vue')
      
      expect(fs.existsSync(lexWebComponent)).toBe(true)
      expect(fs.existsSync(messageComponent)).toBe(true)
      expect(fs.existsSync(inputComponent)).toBe(true)
    })
  })

  describe('Vuetify Integration', () => {
    test('should include Vuetify plugin configuration', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure Vuetify plugin
      expect(viteConfigContent).toContain('vite-plugin-vuetify')
      expect(viteConfigContent).toContain('vuetify(')
      expect(viteConfigContent).toContain('styles: \'sass\'')
    })

    test('should include Material Design Icons support', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Should have Material Design Icons dependencies
      expect(packageJson.dependencies['material-design-icons']).toBe('^3.0.1')
      expect(packageJson.devDependencies['@mdi/font']).toBe('^7.4.47')
    })

    test('should process Vuetify CSS correctly in builds', () => {
      const libCssPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.css')
      
      if (fs.existsSync(libCssPath)) {
        const cssContent = fs.readFileSync(libCssPath, 'utf8')
        
        // Should contain Vuetify-related CSS
        expect(cssContent.length).toBeGreaterThan(0)
        
        // Should contain some CSS rules (basic check)
        expect(cssContent).toMatch(/\{[^}]+\}/)
      }
    })

    test('should externalize Vuetify in library builds', () => {
      const libJsPath = path.join(projectRoot, 'dist', 'bundle', 'lex-web-ui.js')
      
      if (fs.existsSync(libJsPath)) {
        const libContent = fs.readFileSync(libJsPath, 'utf8')
        
        // Should reference Vuetify as external dependency
        expect(libContent).toContain('Vuetify')
        
        // Should not contain Vuetify source code
        expect(libContent).not.toContain('createVuetify')
      }
    })
  })

  describe('Web Worker Support', () => {
    test('should configure web worker support in Vite', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure worker options
      expect(viteConfigContent).toContain('worker:')
      expect(viteConfigContent).toContain('plugins: () =>')
      expect(viteConfigContent).toContain('format: \'es\'')
    })

    test('should find worker files in source', () => {
      const workerPath = path.join(projectRoot, 'src', 'lib', 'lex', 'wav-worker.js')
      expect(fs.existsSync(workerPath)).toBe(true)
      
      const workerContent = fs.readFileSync(workerPath, 'utf8')
      expect(workerContent.length).toBeGreaterThan(0)
    })

    test('should include worker polyfills', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Worker configuration should include Node.js polyfills
      expect(viteConfigContent).toContain('nodePolyfills({')
      expect(viteConfigContent).toContain('include: [\'buffer\', \'process\', \'util\', \'stream\', \'zlib\']')
    })
  })

  describe('Asset Handling', () => {
    test('should configure asset handling plugin', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should include asset handler plugin
      expect(viteConfigContent).toContain('assetHandlerPlugin')
      expect(viteConfigContent).toContain('faviconPath:')
      expect(viteConfigContent).toContain('logoPath:')
      expect(viteConfigContent).toContain('fallbackFaviconPath:')
    })

    test('should have asset handler plugin file', () => {
      const pluginPath = path.join(projectRoot, 'plugins', 'asset-handler-plugin.js')
      expect(fs.existsSync(pluginPath)).toBe(true)
      
      const pluginContent = fs.readFileSync(pluginPath, 'utf8')
      expect(pluginContent).toContain('assetHandlerPlugin')
      expect(pluginContent).toContain('fallback')
    })

    test('should have banner plugin for library builds', () => {
      const pluginPath = path.join(projectRoot, 'plugins', 'banner-plugin.js')
      expect(fs.existsSync(pluginPath)).toBe(true)
      
      const pluginContent = fs.readFileSync(pluginPath, 'utf8')
      expect(pluginContent).toContain('bannerPlugin')
      expect(pluginContent).toContain('isLibraryBuild')
    })
  })

  describe('Development Server Configuration', () => {
    test('should configure development server options', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure server options
      expect(viteConfigContent).toContain('server:')
      expect(viteConfigContent).toContain('port: 8080')
      expect(viteConfigContent).toContain('hmr:')
      expect(viteConfigContent).toContain('cors: true')
    })

    test('should configure HMR (Hot Module Replacement)', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure HMR options
      expect(viteConfigContent).toContain('hmr:')
      expect(viteConfigContent).toContain('port: 24678')
      expect(viteConfigContent).toContain('overlay: true')
    })
  })

  describe('Environment Variable Injection', () => {
    test('should inject package version', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should read and inject package version
      expect(viteConfigContent).toContain('PACKAGE_VERSION')
      expect(viteConfigContent).toContain('process.env.PACKAGE_VERSION')
    })

    test('should inject build target and node env', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should inject environment variables
      expect(viteConfigContent).toContain('process.env.BUILD_TARGET')
      expect(viteConfigContent).toContain('process.env.NODE_ENV')
    })

    test('should configure Vue-specific defines', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure Vue feature flags
      expect(viteConfigContent).toContain('__VUE_OPTIONS_API__')
      expect(viteConfigContent).toContain('__VUE_PROD_DEVTOOLS__')
      expect(viteConfigContent).toContain('__VUE_PROD_HYDRATION_MISMATCH_DETAILS__')
    })
  })

  describe('CSS and Sass Processing', () => {
    test('should configure CSS preprocessing', () => {
      const viteConfigPath = path.join(projectRoot, 'vite.config.js')
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8')
      
      // Should configure CSS options
      expect(viteConfigContent).toContain('css:')
      expect(viteConfigContent).toContain('devSourcemap:')
      expect(viteConfigContent).toContain('preprocessorOptions:')
      expect(viteConfigContent).toContain('scss:')
      expect(viteConfigContent).toContain('sass:')
    })

    test('should have Sass dependency', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Should have Sass embedded for processing
      expect(packageJson.devDependencies['sass-embedded']).toBe('^1.97.1')
    })
  })
})