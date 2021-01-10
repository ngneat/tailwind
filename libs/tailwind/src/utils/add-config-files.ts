import { normalize } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { NormalizedTailwindSchematicsOptions } from '../schematics/schema';
import { isInJest } from './is-in-jest';

export function addConfigFiles({
  enableTailwindInComponentsStyles,
  darkMode,
  appsDir,
  libsDir,
  plugins,
  sourceRoot = 'src',
}: NormalizedTailwindSchematicsOptions): Rule {
  return mergeWith(
    apply(url(isInJest() ? '../files' : './files'), [
      applyTemplates({
        enableTailwindInComponentsStyles,
        darkMode,
        appsDir,
        libsDir,
        plugins,
        sourceRoot,
      }),
      move(normalize('./')),
    ])
  );
}
