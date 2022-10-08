const { replace } = require('esbuild-plugin-replace');

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'cjs',
  platform: 'node',
  plugins: [
    replace({
      values: {
        "import.meta.url": "require('url').pathToFileURL(__filename)",
      }
    })
  ]
}).then(() => {
  console.log('Build complete');
}).catch(() => process.exit(1));