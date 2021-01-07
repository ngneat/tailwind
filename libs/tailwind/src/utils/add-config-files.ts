import { normalize } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { isInJest } from './is-in-jest';

export function addConfigFiles(
  enableTailwindInComponentsStyles: boolean,
  darkMode: 'none' | 'class' | 'media',
  appsDir?: string,
  libsDir?: string,
  sourceRoot = 'src'
): Rule {
  return mergeWith(
    apply(url(isInJest() ? '../files' : './files'), [
      applyTemplates({
        enableTailwindInComponentsStyles,
        darkMode,
        appsDir,
        libsDir,
        sourceRoot,
      }),
      move(normalize('./')),
    ])
  );
}
