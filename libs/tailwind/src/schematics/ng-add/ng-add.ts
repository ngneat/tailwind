import { chain, Rule } from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import { getPackageManager } from '@angular/cli/utilities/package-manager';
import type {
  getWorkspace as getNxWorkspace,
  updateWorkspace as updateNxWorkspace,
} from '@nrwl/workspace';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  getWorkspace,
  updateWorkspace,
} from '@schematics/angular/utility/workspace';
import { execSync } from 'child_process';
import {
  addConfigFiles,
  checkCliVersion,
  getLatestNodeVersion,
  isNx,
  normalizeOptionsNg,
  updateIndexHtml,
  updateProjectRootStyles,
} from '../../utils';
import type {
  NormalizedTailwindSchematicsOptions,
  TailwindSchematicsOptions,
} from '../schema';

export default function (options: TailwindSchematicsOptions): Rule {
  return (tree, context) => {
    if (isNx(tree)) {
      // If ng-add is invoked inside of Nx Workspace, call the nx-setup schematics instead
      context.addTask(new RunSchematicTask('nx-setup', options));
      return tree;
    }

    const [cliVersion, isTailwindSupported] = checkCliVersion(
      tree,
      '11.2',
      '>='
    );

    if (!isTailwindSupported) {
      const tailwindPkg = '@ngneat/tailwind';
      const tailwindDep = getPackageJsonDependency(tree, tailwindPkg);

      if (tailwindDep != null) {
        execSync(`${getPackageManager(tree.root.path)} rm ${tailwindPkg}`);
      }
      context.logger.info(`
Detected AngularCLI version is ${cliVersion} which does not support TailwindCSS natively.
Please run "ng add @ngneat/tailwind@6" for Custom Webpack support.
`);
      return tree;
    }

    return normalizeOptionsNg(options, tree).then((normalizedOptions) =>
      chain([
        addPackageJsonDependencies(normalizedOptions.dependencies),
        installDependencies(),
        setupProject(normalizedOptions),
      ])
    ) as ReturnType<Rule>;
  };
}

function addPackageJsonDependencies(dependencies: string[]): Rule {
  return (tree, context) => {
    return Promise.all(
      dependencies.map((dep) =>
        getLatestNodeVersion(dep).then(({ name, version }) => {
          context.logger.info(`✅️ Added ${name}@${version}`);
          const nodeDependency: NodeDependency = {
            name,
            version,
            type: NodeDependencyType.Dev,
            overwrite: false,
          };
          addPackageJsonDependency(tree, nodeDependency);
        })
      )
    ).then(() => tree) as ReturnType<Rule>;
  };
}

function installDependencies(): Rule {
  return (tree, context) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.info('✅️ Installed dependencies');
    return tree;
  };
}

function setupProject(options: NormalizedTailwindSchematicsOptions): Rule {
  return chain([
    addConfigFiles(options),
    updateProjectRootStyles(
      options.project,
      (getWorkspace as unknown) as typeof getNxWorkspace,
      (updateWorkspace as unknown) as typeof updateNxWorkspace
    ),
    updateIndexHtml(
      options.project,
      options.darkMode,
      (updateWorkspace as unknown) as typeof updateNxWorkspace
    ),
  ]);
}
