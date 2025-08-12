// ESLint flat config for ESLint v9+
// - Server code: CommonJS Node globals
// - Browser code: Babylon globals declared
// - Ignore generated artifacts and external templates

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'create-react-app/**',
      '.vercel/**',
      'dist/**'
    ]
  },
  {
    files: ['server/**/*.js', 'api/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: true,
        module: true,
        require: true,
        __dirname: true,
        process: true,
        setTimeout: true,
        setInterval: true
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-undef': 'error',
      'no-console': 'off'
    }
  },
  {
    files: ['Assets/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        window: true,
        document: true,
        BABYLON: true,
        HK: true,
        WebSocket: true,
        performance: true
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-undef': 'off',
      'no-console': 'off'
    }
  }
];
