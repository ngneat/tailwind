import { DEPENDENCIES } from '../constants';

export function getDependencies(
  plugins: string[] = []
): { dependencies: string[]; plugins: string[] } {
  const pluginPackages = plugins?.map((plugin) => `@tailwindcss/${plugin}`);

  return {
    dependencies: [...DEPENDENCIES, ...pluginPackages],
    plugins: pluginPackages.map((pkg) => `require('${pkg}')`),
  };
}
