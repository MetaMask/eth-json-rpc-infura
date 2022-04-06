module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        // This rule is not designed to be run against a module that uses
        // CommonJS-style imports.
        'import/unambiguous': 'off',
      },
    },

    {
      files: ['.eslintrc.js', '.prettierrc.js'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};
