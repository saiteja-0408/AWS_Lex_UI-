/**
 * Jest configuration for integration tests
 */

export default {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/test/integration/**/*.test.js'
  ],
  
  // Disable transform to avoid Babel issues
  transform: {},
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test timeout (builds can take time)
  testTimeout: 300000, // 5 minutes
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Coverage (optional)
  collectCoverage: false,
  
  // Verbose output
  verbose: true,
  
  // Root directory
  rootDir: '../../',
  
  // Ignore babel config for integration tests
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ]
}