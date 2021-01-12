import { chain, Rule } from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import type {
  getWorkspace as getNxWorkspace,
  InsertChange as NxInsertChange,
  updateWorkspace as updateNxWorkspace,
} from '@nrwl/workspace';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  getWorkspace,
  updateWorkspace,
} from '@schematics/angular/utility/workspace';
import {
  addConfigFiles,
  getLatestNodeVersion,
  isNx,
  updateProjectRootStyles,
  updateWorkspaceTargets,
} from '../../utils';
import { normalizeOptions } from '../../utils/normalize-options';
import { updateIndexHtml } from '../../utils/update-index-html';
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
    const normalizedOptions = normalizeOptions(options, tree, context);

    return chain([
      addPackageJsonDependencies(normalizedOptions.dependencies),
      installDependencies(),
      setupProject(normalizedOptions),
    ])(tree, context);
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
    updateWorkspaceTargets(
      options.project,
      (updateWorkspace as unknown) as typeof updateNxWorkspace
    ),
    updateProjectRootStyles(
      options.project,
      (getWorkspace as unknown) as typeof getNxWorkspace,
      (InsertChange as unknown) as typeof NxInsertChange
    ),
    updateIndexHtml(
      options.project,
      options.darkMode,
      (updateWorkspace as unknown) as typeof updateNxWorkspace
    ),
  ]);
}
