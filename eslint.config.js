const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'ios/*', 'android/*', 'supabase/*'],
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Cor só via token do tema — nada de hexadecimal solto no componente
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Use os tokens do tema (src/theme/tokens.ts) em vez de cor hexadecimal literal.',
        },
      ],
    },
  },
  {
    // Tokens e configs podem ter hex
    files: ['src/theme/**', 'tailwind.config.js', 'app.config.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
];
