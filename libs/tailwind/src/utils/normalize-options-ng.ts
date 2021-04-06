import { Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import type {
  NormalizedTailwindSchematicsOptions,
  TailwindSchematicsOptions,
} from '../schematics/schema';
import { getDependencies } from './get-dependencies';

export async function normalizeOptionsNg(
  options: TailwindSchematicsOptions,
  tree: Tree
): Promise<NormalizedTailwindSchematicsOptions> {
  const { plugins, dependencies } = getDependencies(options.plugins);
  const darkMode = options.darkMode || 'none';

  const workspace = await getWorkspace(tree);
  const sourceRoot = workspace.projects[options.project]?.sourceRoot;

  return {
    ...options,
    darkMode,
    dependencies,
    sourceRoot,
    plugins,
  };
}
