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
import { getWorkspace as getWorkspaceConfig } from '@schematics/angular/utility/config';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  getWorkspace,
  updateWorkspace,
} from '@schematics/angular/utility/workspace';

import { DEPENDENCIES } from '../../constants';
import {
  addConfigFiles,
  getLatestNodeVersion,
  isNx,
  updateProjectRootStyles,
  updateWorkspaceTargets,
} from '../../utils';
import type { TailwindSchematicsOptions } from '../schema';

export default function (options: TailwindSchematicsOptions): Rule {
  return (tree, context) => {
    if (isNx(tree)) {
      // If ng-add is invoked inside of Nx Workspace, call the nx-setup schematics instead
      context.addTask(new RunSchematicTask('nx-setup', options));
      return tree;
    }

    const workspace = getWorkspaceConfig(tree);
    const projectSourceRoot = workspace.projects[options.project]?.sourceRoot;

    return chain([
      addPackageJsonDependencies(),
      installDependencies(),
      setupProject(options, projectSourceRoot),
    ])(tree, context);
  };
}

function addPackageJsonDependencies(): Rule {
  return (tree, context) => {
    return Promise.all(
      [...DEPENDENCIES].map((dep) =>
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

function setupProject(
  options: TailwindSchematicsOptions,
  projectSourceRoot?: string
): Rule {
  return chain([
    addConfigFiles(
      options.enableTailwindInComponentsStyles,
      options.darkMode,
      undefined,
      undefined,
      projectSourceRoot
    ),
    updateWorkspaceTargets(
      options.project,
      (updateWorkspace as unknown) as typeof updateNxWorkspace
    ),
    updateProjectRootStyles(
      options.project,
      (getWorkspace as unknown) as typeof getNxWorkspace,
      (InsertChange as unknown) as typeof NxInsertChange
    ),
  ]);
}
