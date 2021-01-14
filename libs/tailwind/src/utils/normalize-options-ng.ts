import { Tree } from '@angular-devkit/schematics';
import { getWorkspace as getWorkspaceConfig } from '@schematics/angular/utility/config';
import {
  NormalizedTailwindSchematicsOptions,
  TailwindSchematicsOptions,
} from '../schematics/schema';
import { getDependencies } from './get-dependencies';

export function normalizeOptionsNg(
  options: TailwindSchematicsOptions,
  tree: Tree
): NormalizedTailwindSchematicsOptions {
  const { plugins, dependencies } = getDependencies(options.plugins);
  const darkMode = options.darkMode || 'none';

  const workspace = getWorkspaceConfig(tree);
  const sourceRoot = workspace.projects[options.project]?.sourceRoot;

  return {
    ...options,
    darkMode,
    dependencies,
    sourceRoot,
    plugins,
  };
}
