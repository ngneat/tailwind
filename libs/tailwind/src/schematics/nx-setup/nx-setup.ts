import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { getPackageManagerCommand } from '@nrwl/tao/src/shared/package-manager';
import {
  addDepsToPackageJson,
  getWorkspace,
  updateWorkspace,
} from '@nrwl/workspace';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { execSync } from 'child_process';
import {
  addConfigFiles,
  checkCliVersion,
  getLatestNodeVersion,
  isNx,
  minimumAngularCliVersion,
  updateIndexHtml,
  updateProjectRootStyles,
} from '../../utils';
import { normalizeOptionsNx } from '../../utils/normalize-options-nx';
import type { TailwindSchematicsOptions } from '../schema';

export default function (options: TailwindSchematicsOptions): Rule {
  return (tree, context) => {
    const [ngCliVersion, isTailwindSupported] = checkCliVersion(
      tree,
      minimumAngularCliVersion,
      '>='
    );

    if (!isTailwindSupported && ngCliVersion) {
      const tailwindPkg = '@ngneat/tailwind';
      const tailwindDep = getPackageJsonDependency(tree, tailwindPkg);

      if (tailwindDep != null) {
        execSync(`${getPackageManagerCommand().rm} ${tailwindPkg}`);
      }
      context.logger.info(`
Detected AngularCLI version is ${ngCliVersion} which does not support TailwindCSS natively.
Please run "ng add @ngneat/tailwind@6" for Custom Webpack support.
`);
      return tree;
    }

    if (!isNx(tree)) {
      context.logger.fatal(
        'Schematics is not invoked inside of a Nx workspace. Please try again in a Nx workspace.'
      );
      return;
    }

    const normalizedOptions = normalizeOptionsNx(options, tree, context);

    return chain([
      addDependenciesToPackageJson(normalizedOptions.dependencies),
      addConfigFiles(normalizedOptions),
      updateProjectRootStyles(
        normalizedOptions.projectName,
        getWorkspace,
        updateWorkspace
      ),
      updateIndexHtml(
        normalizedOptions.projectName,
        normalizedOptions.darkMode,
        updateWorkspace
      ),
    ])(tree, context);
  };
}

function addDependenciesToPackageJson(dependencies: string[]): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    const devDeps = (
      await Promise.all(
        dependencies.map((dep) =>
          getLatestNodeVersion(dep).then(({ name, version }) => {
            ctx.logger.info(`✅️ Added ${name}@${version}`);
            return { name, version };
          })
        )
      )
    ).reduce((result, { name, version }) => {
      result[name] = version;
      return result;
    }, {} as Record<string, string>);

    return addDepsToPackageJson({}, devDeps)(tree, ctx) as Rule;
  };
}
