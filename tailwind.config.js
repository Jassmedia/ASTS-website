/**
 * Tailwind is available for new utility styling, namespaced with the `tw-` prefix
 * so its class names can never collide with the ported theme classes
 * (e.g. .container, .contents, .grid, .list, .sticky, .hidden all exist in the
 * theme / LearnPress CSS). Preflight is disabled so the theme CSS is not reset.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  prefix: 'tw-',
  corePlugins: { preflight: false, container: false },
  theme: { extend: {} },
  plugins: [],
};
