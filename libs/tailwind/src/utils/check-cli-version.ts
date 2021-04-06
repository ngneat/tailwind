import type { Tree } from '@angular-devkit/schematics';
import { SchematicsException } from '@angular-devkit/schematics';
import type { CompareOperator } from './compare-version';
import { compareVersions } from './compare-version';

export function checkCliVersion(
  tree: Tree,
  cliVersionToCheck: string,
  operator: CompareOperator
): [string, boolean] {
  try {
    const ngCliPackageJsonBuffer = tree.read(
      './node_modules/@angular/cli/package.json'
    );

    if (ngCliPackageJsonBuffer == null) {
      return ['', false];
    }

    const packageJson = JSON.parse(ngCliPackageJsonBuffer.toString());
    const currentCliVersion = packageJson['version'] as string;

    return [
      currentCliVersion,
      compareVersions(currentCliVersion, cliVersionToCheck, operator),
    ];
  } catch (e) {
    throw new SchematicsException(
      'Could not find @angular/cli package.json. Make sure to have @angular/cli installed'
    );
  }
}
