import type { Configuration, RuleSetLoader, RuleSetUseItem } from 'webpack';

export function addTailwindPlugin(
  webpackConfig: Configuration,
  tailwindConfig,
  components = false
) {
  if (!tailwindConfig) {
    console.error('Missing tailwind config :', tailwindConfig);
    return;
  }
  if (tailwindConfig.purge && tailwindConfig.purge.enabled == null) {
    tailwindConfig.purge.enabled = webpackConfig.mode === 'production';
  }
  const pluginName = 'autoprefixer';
  for (const rule of webpackConfig.module.rules) {
    const ruleSetUseItems = rule.use as RuleSetUseItem[];
    if (
      !(ruleSetUseItems && ruleSetUseItems.length > 0) ||
      (!components && rule.exclude)
    ) {
      continue;
    }

    for (const useLoader of ruleSetUseItems) {
      const ruleSetLoader = useLoader as RuleSetLoader;
      const ruleSetLoaderOptions = ruleSetLoader.options as {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        [k: string]: any;
      };

      if (!ruleSetLoaderOptions) {
        continue;
      }

      if (ruleSetLoaderOptions.postcssOptions) {
        const originPostcssOptions = ruleSetLoaderOptions.postcssOptions;

        ruleSetLoaderOptions.postcssOptions = (loader) => {
          const _postcssOptions = originPostcssOptions(loader);
          const insertIndex = getInsertIndex(
            _postcssOptions.plugins,
            pluginName
          );

          if (insertIndex !== -1) {
            insertTailwindPlugin(_postcssOptions.plugins, insertIndex, [
              'tailwindcss',
              tailwindConfig,
            ]);
          } else {
            console.error(`${pluginName} not found in postcss plugins`);
          }

          return _postcssOptions;
        };
      } else {
        if (ruleSetLoader.loader?.includes('postcss')) {
          const originalPostcssPluginFn = ruleSetLoaderOptions.plugins;

          if (!originalPostcssPluginFn) {
            continue;
          }

          ruleSetLoaderOptions.plugins = (...args) => {
            const plugins = originalPostcssPluginFn(...args);
            const insertIndex = getInsertIndex(plugins, pluginName);
            if (insertIndex !== -1) {
              insertTailwindPlugin(
                plugins,
                insertIndex,
                /* eslint-disable @typescript-eslint/no-var-requires */
                require('tailwindcss')(tailwindConfig)
              );
            } else {
              console.error(`${pluginName} not found in postcss plugins`);
            }

            return plugins;
          };
        }
      }
    }
  }
}

function getInsertIndex(
  plugins: { postcssPlugin?: string }[],
  pluginToInsertAfter: string
): number {
  return plugins.findIndex(
    ({ postcssPlugin }) => postcssPlugin?.toLowerCase() === pluginToInsertAfter
  );
}

function insertTailwindPlugin(
  plugins: unknown[],
  index: number,
  tailwindPlugin: unknown
): void {
  plugins.splice(index, 0, tailwindPlugin);
}