import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  getWorkspace,
  InsertChange,
  updateWorkspace,
} from '@nrwl/workspace';
import {
  addConfigFiles,
  getLatestNodeVersion,
  isNx,
  updateProjectRootStyles,
  updateWorkspaceTargets,
} from '../../utils';
import { normalizeOptions } from '../../utils/normalize-options';
import { updateIndexHtml } from '../../utils/update-index-html';
import type { TailwindSchematicsOptions } from '../schema';

export default function (options: TailwindSchematicsOptions): Rule {
  return (tree, context) => {
    if (!isNx(tree)) {
      context.logger.fatal(
        'Schematics is not invoked inside of a Nx workspace. Please try again in a Nx workspace.'
      );
      return;
    }

    const normalizedOptions = normalizeOptions(options, tree, context);

    return chain([
      addDependenciesToPackageJson(normalizedOptions.dependencies),
      addConfigFiles(normalizedOptions),
      updateWorkspaceTargets(normalizedOptions.projectName, updateWorkspace),
      updateProjectRootStyles(
        normalizedOptions.projectName,
        getWorkspace,
        InsertChange
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
