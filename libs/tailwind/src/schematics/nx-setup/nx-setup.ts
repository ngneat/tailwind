import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addDepsToPackageJson,
  getProjectGraphFromHost,
  getWorkspace,
  InsertChange,
  ProjectGraph,
  ProjectGraphNode,
  projectRootDir,
  ProjectType,
  updateWorkspace,
} from '@nrwl/workspace';
import { appsDir, libsDir } from '@nrwl/workspace/src/utils/ast-utils';
import { DEPENDENCIES } from '../../constants';
import {
  addConfigFiles,
  getLatestNodeVersion,
  isNx,
  updateProjectRootStyles,
  updateWorkspaceTargets,
} from '../../utils';
import type { TailwindSchematicsOptions } from '../schema';

interface NormalizedTailwindSchematicsOptions
  extends TailwindSchematicsOptions {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  appsDir?: string;
  libsDir?: string;
}

export default function (options: TailwindSchematicsOptions): Rule {
  return (tree, context) => {
    if (!isNx(tree)) {
      context.logger.fatal(
        'Schematics is not invoked inside of a Nx workspace. Please try again in a Nx workspace.'
      );
      return;
    }

    const { enableTailwindInComponentsStyles, projectName, appsDir, libsDir } = normalizeOptions(
      options,
      tree,
      context
    );

    return chain([
      addDependenciesToPackageJson(),
      addConfigFiles(enableTailwindInComponentsStyles, appsDir, libsDir),
      updateWorkspaceTargets(projectName, updateWorkspace),
      updateProjectRootStyles(projectName, getWorkspace, updateWorkspace),
    ])(tree, context);
  };
}

function addDependenciesToPackageJson(): Rule {
  return async (tree: Tree, ctx: SchematicContext) => {
    const devDeps = (
      await Promise.all(
        [...DEPENDENCIES].map((dep) =>
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

function normalizeOptions(
  options: TailwindSchematicsOptions,
  tree: Tree,
  context: SchematicContext
): NormalizedTailwindSchematicsOptions {
  const project = getDefaultProjectFromGraph(
    getProjectGraphFromHost(tree),
    options.project
  );

  if (project == null) {
    const msg = `Cannot find any Angular project in the current workspace.`;
    context.logger.fatal(msg);
    throw new Error(msg);
  }

  return {
    ...options,
    project: project.name,
    projectName: project.name,
    projectDirectory: project.data.root
      .split(projectRootDir(ProjectType.Application) + '/')
      .pop(),
    projectRoot: project.data.root,
    appsDir: appsDir(tree),
    libsDir: libsDir(tree),
  };
}

function getDefaultProjectFromGraph(
  graph: ProjectGraph,
  projectName?: string
): ProjectGraphNode {
  if (projectName) return graph.nodes[projectName];
  return Object.values(graph.nodes).find(
    (node) =>
      node.type === 'app' &&
      node.data.projectType === ProjectType.Application &&
      Object.values(node.data.architect).some((target) =>
        target.builder.includes('angular')
      )
  );
}
