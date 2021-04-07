import { normalize } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  forEach,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { parse } from 'path';
import { NormalizedTailwindSchematicsOptions } from '../schematics/schema';
import { isInJest } from './is-in-jest';

export function addConfigFiles({
  enableJit,
  darkMode,
  appsDir,
  libsDir,
  plugins,
  sourceRoot = 'src',
}: NormalizedTailwindSchematicsOptions): Rule {
  return (tree, context) =>
    mergeWith(
      apply(url(isInJest() ? '../files' : './files'), [
        forEach((entry) => {
          const entryName = parse(entry.path.split('/').pop());
          return tree.exists(`./${entryName.name}`) ? null : entry;
        }),
        applyTemplates({
          enableJit,
          darkMode,
          appsDir,
          libsDir,
          plugins,
          sourceRoot,
        }),
        move(normalize('./')),
      ])
    )(tree, context);
}
