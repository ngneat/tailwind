import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  getProjectGraphFromHost,
  ProjectGraph,
  ProjectGraphNode,
  projectRootDir,
  ProjectType,
} from '@nrwl/workspace';
import { appsDir, libsDir } from '@nrwl/workspace/src/utils/ast-utils';
import { getWorkspace as getWorkspaceConfig } from '@schematics/angular/utility/config';
import { DEPENDENCIES } from '../constants';
import {
  NormalizedTailwindSchematicsOptions,
  TailwindSchematicsOptions,
} from '../schematics/schema';
import { isNx } from './is-nx';

export function getDefaultProjectFromGraph(
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

export function normalizeOptions(
  options: TailwindSchematicsOptions,
  tree: Tree,
  context: SchematicContext
): NormalizedTailwindSchematicsOptions {
  const plugins = options.plugins || [];
  const pluginPackages = plugins?.map((plugin) => `@tailwindcss/${plugin}`);
  const pluginRequires = pluginPackages.map((pkg) => `require('${pkg}')`);
  const dependencies = [...DEPENDENCIES, ...pluginPackages];
  const darkMode = options.darkMode || 'none';
  if (isNx(tree)) {
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
      darkMode,
      dependencies,
      plugins: pluginRequires,
    };
  }

  const workspace = getWorkspaceConfig(tree);
  const sourceRoot = workspace.projects[options.project]?.sourceRoot;

  return {
    ...options,
    darkMode,
    dependencies,
    sourceRoot,
    plugins: pluginRequires,
  };
}
